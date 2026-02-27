import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Plus, Clock, Users, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react'
import api from '../lib/api'
import type { RendezVous, ApiResponse, PaginationMeta } from '../types'

export default function AppointmentsPage() {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch appointments (à implémenter complètement plus tard)
  const { data, isLoading } = useQuery({
    queryKey: ['rendez-vous', selectedDate],
    queryFn: async () => {
      // Pour l'instant, retourne des données mockées
      return {
        appointments: [] as RendezVous[],
        pagination: {
          total: 0,
          currentPage: 1,
          totalPages: 1,
          page: 1,
          limit: 10
        } as PaginationMeta,
        stats: {
          today: 0,
          upcoming: 0,
          confirmed: 0,
          pending: 0
        }
      }
    },
  })

  const stats = data?.stats || { today: 0, upcoming: 0, confirmed: 0, pending: 0 }
  const totalAppointments = data?.pagination.total || 0

  return (
    <div className="space-y-8">
      {/* Header - Premium Style */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-6">
            {/* Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Rendez-vous</h1>
                <span className="px-4 py-1.5 bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700 text-sm font-semibold rounded-full border border-violet-200/60 shadow-sm">
                  {totalAppointments} {totalAppointments > 1 ? 'rendez-vous' : 'rendez-vous'}
                </span>
              </div>
              <p className="text-base text-gray-500 max-w-2xl">
                Gérez l'agenda du cabinet, planifiez et suivez les consultations
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium">{stats.today}</span>
                  <span className="text-gray-400">aujourd'hui</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{stats.upcoming}</span>
                  <span className="text-gray-400">à venir</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{stats.confirmed}</span>
                  <span className="text-gray-400">confirmés</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            Nouveau Rendez-vous
          </button>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100/80 backdrop-blur-xl rounded-xl border border-gray-200/60">
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Calendrier
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedView === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Liste
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-150 text-sm"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-xl hover:bg-white transition-all duration-150 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Cards */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Rendez-vous à confirmer</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Patients confirmés</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Consultations du jour</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : selectedView === 'calendar' ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vue Calendrier</h3>
            <p className="text-gray-500 mb-6">Le calendrier interactif sera implémenté ici</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Intégration FullCalendar prévue
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vue Liste</h3>
            <p className="text-gray-500 mb-6">La liste détaillée des rendez-vous sera affichée ici</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Table interactive avec filtres prévue
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

