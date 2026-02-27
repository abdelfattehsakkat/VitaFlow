import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus, Clock, CheckCircle2, Edit2, Trash2 } from 'lucide-react'
import type { View } from 'react-big-calendar'
import api from '../lib/api'
import type { RendezVous, ApiResponse, PaginationMeta } from '../types'
import AppointmentCalendar from '../components/AppointmentCalendar'
import AppointmentForm from '../components/AppointmentForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const [selectedView] = useState<'calendar' | 'list'>('calendar')
  const [calendarDate, setCalendarDate] = useState(new Date())
  // Vue par défaut : 'day' sur mobile (< 768px), 'week' sur desktop
  const [calendarView, setCalendarView] = useState<View>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'
  })
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<RendezVous | null>(null)
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null)
  const [appointmentToDelete, setAppointmentToDelete] = useState<RendezVous | null>(null)

  // Fetch appointments
  const { data, isLoading } = useQuery({
    queryKey: ['rendez-vous'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ rendezVous: RendezVous[]; pagination: PaginationMeta }>>('/rendez-vous')
      return response.data.data.rendezVous
    },
  })

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/rendez-vous/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] })
    },
  })

  const handleDelete = (appointment: RendezVous) => {
    setAppointmentToDelete(appointment)
  }

  const confirmDelete = () => {
    if (appointmentToDelete) {
      deleteMutation.mutate(appointmentToDelete._id)
      setAppointmentToDelete(null)
    }
  }

  const handleSelectEvent = (appointment: RendezVous) => {
    setSelectedAppointment(appointment)
    setSlotInfo(null)
    setShowForm(true)
  }

  const handleSelectSlot = (info: { start: Date; end: Date }) => {
    setSelectedAppointment(null)
    setSlotInfo(info)
    setShowForm(true)
  }

  const handleAddAppointment = () => {
    setSelectedAppointment(null)
    setSlotInfo(null)
    setShowForm(true)
  }

  const appointments = Array.isArray(data) ? data : []
  
  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const stats = {
    today: appointments.filter(rdv => rdv.date.startsWith(today)).length,
    upcoming: appointments.filter(rdv => new Date(rdv.date) > new Date()).length,
    confirmed: appointments.filter(rdv => rdv.statut === 'confirme').length,
    pending: appointments.filter(rdv => rdv.statut === 'planifie').length,
  }
  
  const totalAppointments = appointments.length

  const formatTime = (time: string) => time
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'planifie':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
      case 'confirme':
        return 'bg-green-50 text-green-700 border-green-200/60'
      case 'termine':
        return 'bg-gray-50 text-gray-700 border-gray-200/60'
      case 'annule':
        return 'bg-red-50 text-red-700 border-red-200/60'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200/60'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifié'
      case 'confirme': return 'Confirmé'
      case 'termine': return 'Terminé'
      case 'annule': return 'Annulé'
      default: return statut
    }
  }

  return (
    <div className="space-y-4">
      {/* Header - Premium Style */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 sm:gap-6">
            {/* Icon Badge */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">Rendez-vous</h1>
                <span className="px-2 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700 text-xs sm:text-sm font-semibold rounded-full border border-violet-200/60 shadow-sm">
                  {totalAppointments}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl hidden sm:block">
                Gérez l'agenda du cabinet, planifiez et suivez les consultations
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium">{stats.today}</span>
                  <span className="text-gray-400 hidden sm:inline">aujourd'hui</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="font-medium">{stats.upcoming}</span>
                  <span className="text-gray-400 hidden sm:inline">à venir</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 hidden md:flex">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="font-medium">{stats.confirmed}</span>
                  <span className="text-gray-400 hidden sm:inline">confirmés</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleAddAppointment}
            className="group flex items-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-lg sm:rounded-xl hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium text-sm sm:text-base"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            <span className="hidden sm:inline">RDV</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {selectedView === 'calendar' ? (
          <div className="p-2 sm:p-3">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement du calendrier...</p>
              </div>
            ) : (
              <AppointmentCalendar
                appointments={appointments}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                date={calendarDate}
                onNavigate={setCalendarDate}
                view={calendarView}
                onView={setCalendarView}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des rendez-vous...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucun rendez-vous trouvé</p>
                <p className="text-gray-400 text-sm mt-2">Cliquez sur "Nouveau rendez-vous" pour en créer un</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Heure</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {appointments.map((rdv) => (
                    <tr key={rdv._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{rdv.patientNom}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(rdv.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTime(rdv.heureDebut)} - {formatTime(rdv.heureFin)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatutBadgeClass(rdv.statut)}`}>
                          {getStatutLabel(rdv.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSelectEvent(rdv)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rdv)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          defaultDate={slotInfo?.start}
          defaultStart={slotInfo?.start}
          defaultEnd={slotInfo?.end}
          onClose={() => {
            setShowForm(false)
            setSelectedAppointment(null)
            setSlotInfo(null)
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={appointmentToDelete !== null}
        title="Supprimer le rendez-vous"
        message={appointmentToDelete ? `Êtes-vous sûr de vouloir supprimer définitivement le rendez-vous de ${appointmentToDelete.patientNom} ? Cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  )
}
