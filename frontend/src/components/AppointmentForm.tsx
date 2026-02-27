import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { X, Search } from 'lucide-react'
import api from '../lib/api'
import type { RendezVous, Patient, ApiResponse } from '../types'

interface AppointmentFormProps {
  appointment: RendezVous | null
  defaultDate?: Date
  defaultStart?: Date
  defaultEnd?: Date
  onClose: () => void
}

export default function AppointmentForm({ appointment, defaultDate, defaultStart, defaultEnd, onClose }: AppointmentFormProps) {
  const queryClient = useQueryClient()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Format date for input[type="date"]
  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }
  
  // Format time for input[type="time"]
  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5) // HH:mm
  }

  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    date: appointment?.date ? formatDateForInput(appointment.date) : (defaultDate ? formatDateForInput(defaultDate) : new Date().toISOString().split('T')[0]),
    heureDebut: appointment?.heureDebut || (defaultStart ? formatTimeForInput(defaultStart) : '09:00'),
    heureFin: appointment?.heureFin || (defaultEnd ? formatTimeForInput(defaultEnd) : '10:00'),
    notes: appointment?.notes || '',
    statut: appointment?.statut || 'planifie',
  })

  const [searchQuery, setSearchQuery] = useState(appointment?.patientNom || '')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Search patients
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['patients-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return []
      const response = await api.get<ApiResponse<{ patients: Patient[] }>>(`/patients?search=${encodeURIComponent(searchQuery)}&limit=10`)
      return response.data.data.patients
    },
    enabled: searchQuery.length >= 2,
  })

  // Load initial patient if editing
  useEffect(() => {
    if (appointment?.patientId && !selectedPatient) {
      api.get<ApiResponse<Patient>>(`/patients/${appointment.patientId}`)
        .then(response => {
          const patient = response.data.data
          setSelectedPatient(patient)
          setSearchQuery(`${patient.nom} ${patient.prenom} (${patient.id})`)
        })
        .catch(() => {})
    }
  }, [appointment?.patientId, selectedPatient])

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (appointment) {
        return api.patch(`/rendez-vous/${appointment._id}`, data)
      } else {
        return api.post('/rendez-vous', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientId) {
      return
    }
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowDropdown(value.length >= 2)
    if (value.length < 2) {
      setSelectedPatient(null)
      setFormData({ ...formData, patientId: '' })
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchQuery(`${patient.nom} ${patient.prenom} (${patient.id})`)
    setFormData({ ...formData, patientId: patient._id })
    setShowDropdown(false)
  }

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 max-h-[90vh] overflow-auto">
          <div className="px-6 py-5 border-b border-gray-200/60 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {appointment ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-150"
              disabled={mutation.isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Patient Search */}
            <div className="relative" ref={searchInputRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient *
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  placeholder="Rechercher par nom, prénom, téléphone ou ID..."
                  required={!formData.patientId}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                />
              </div>
              
              {/* Dropdown résultats */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      Recherche...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((patient) => (
                        <button
                          key={patient._id}
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {patient.nom} {patient.prenom}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                            <span>ID: {patient.id}</span>
                            <span>Tel: {patient.telephone}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun patient trouvé
                    </div>
                  ) : null}
                </div>
              )}
              
              {selectedPatient && (
                <div className="mt-2 p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm">
                  <span className="font-medium text-violet-900">Patient sélectionné :</span>{' '}
                  <span className="text-violet-700">{selectedPatient.nom} {selectedPatient.prenom} (ID: {selectedPatient.id})</span>
                </div>
              )}
            </div>

            {/* Date & Horaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure début *
                </label>
                <input
                  type="time"
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleChange}
                  required
                  step="900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure fin *
                </label>
                <input
                  type="time"
                  name="heureFin"
                  value={formData.heureFin}
                  onChange={handleChange}
                  required
                  step="900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Statut *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
              >
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notes additionnelles..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150 resize-none"
              />
            </div>

            {mutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200/60 rounded-xl text-red-700 text-sm">
                <strong>Erreur:</strong> {(mutation.error as any)?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/60">
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-150 disabled:opacity-50 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-6 py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-200 disabled:opacity-50 font-medium"
              >
                {mutation.isPending ? 'Enregistrement...' : appointment ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
