import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import api from '../lib/api'
import type { RendezVous, Patient, User, ApiResponse } from '../types'

interface AppointmentFormProps {
  appointment: RendezVous | null
  defaultDate?: Date
  defaultStart?: Date
  defaultEnd?: Date
  onClose: () => void
}

export default function AppointmentForm({ appointment, defaultDate, defaultStart, defaultEnd, onClose }: AppointmentFormProps) {
  const queryClient = useQueryClient()
  
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
    medecinId: appointment?.medecinId || '',
    date: appointment?.date ? formatDateForInput(appointment.date) : (defaultDate ? formatDateForInput(defaultDate) : new Date().toISOString().split('T')[0]),
    heureDebut: appointment?.heureDebut || (defaultStart ? formatTimeForInput(defaultStart) : '09:00'),
    heureFin: appointment?.heureFin || (defaultEnd ? formatTimeForInput(defaultEnd) : '10:00'),
    motif: appointment?.motif || '',
    notes: appointment?.notes || '',
    statut: appointment?.statut || 'planifie',
  })

  // Fetch patients for select
  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ patients: Patient[] }>>('/patients?limit=1000')
      return response.data.data.patients
    },
  })

  // Fetch medecins for select
  const { data: medecinsData } = useQuery({
    queryKey: ['medecins-list'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>('/auth/users?role=medecin')
      return response.data.data
    },
  })

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
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
            {/* Patient & Médecin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                >
                  <option value="">Sélectionner un patient</option>
                  {patientsData?.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.nom} {patient.prenom} ({patient.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Médecin *
                </label>
                <select
                  name="medecinId"
                  value={formData.medecinId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecinsData?.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr. {medecin.nom} {medecin.prenom}
                    </option>
                  ))}
                </select>
              </div>
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

            {/* Motif */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motif *
              </label>
              <input
                type="text"
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                required
                placeholder="Ex: Consultation de suivi, Examen..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150"
              />
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
                Notes (optionnel)
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
                Une erreur est survenue. Veuillez réessayer.
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
