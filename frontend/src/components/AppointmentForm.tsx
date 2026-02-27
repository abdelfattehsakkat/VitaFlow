import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { X, Search, Calendar, Users, Clock, Trash2 } from 'lucide-react'
import api from '../lib/api'
import type { RendezVous, Patient, ApiResponse } from '../types'

interface AppointmentFormProps {
  appointment: RendezVous | null
  defaultDate?: Date
  defaultStart?: Date
  defaultEnd?: Date
  onClose: () => void
  onDelete?: (appointment: RendezVous) => void
}

export default function AppointmentForm({ appointment, defaultDate, defaultStart, defaultEnd, onClose, onDelete }: AppointmentFormProps) {
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-auto">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {appointment ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              disabled={mutation.isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Patient Search */}
            <div className="relative" ref={searchInputRef}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                Patient *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  placeholder="Rechercher par nom, prénom, téléphone ou ID..."
                  required={!formData.patientId}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              {/* Dropdown résultats */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
                      <span className="text-sm">Recherche...</span>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((patient) => (
                        <button
                          key={patient._id}
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {patient.nom} {patient.prenom}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-4 mt-0.5">
                            <span>ID: {patient.id}</span>
                            <span>Tel: {patient.telephone}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      <span className="text-sm">Aucun patient trouvé</span>
                    </div>
                  ) : null}
                </div>
              )}
              
              {selectedPatient && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-900">{selectedPatient.nom} {selectedPatient.prenom}</span>
                      <span className="text-gray-500 ml-2">(ID: {selectedPatient.id})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Horaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Heure début *
                </label>
                <input
                  type="time"
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleChange}
                  required
                  step="900"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Heure fin *
                </label>
                <input
                  type="time"
                  name="heureFin"
                  value={formData.heureFin}
                  onChange={handleChange}
                  required
                  step="900"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Statut *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                }}
              >
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notes ou remarques additionnelles..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {mutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Erreur:</strong> {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
              <div>
                {appointment && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(appointment)
                      onClose()
                    }}
                    className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={mutation.isPending}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>{appointment ? 'Mettre à jour' : 'Créer'}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
