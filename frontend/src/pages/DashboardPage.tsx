import { useQuery } from '@tanstack/react-query'
import { Clock, Calendar, ArrowRight, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import WeatherWidget from '../components/WeatherWidget'
import api from '../lib/api'
import type { ApiResponse } from '../types'

interface RendezVous {
  _id: string
  date: string
  heureDebut: string
  heureFin: string
  motif: string
  statut: string
  patientId: {
    _id: string
    nom: string
    prenom: string
    telephone: string
  }
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  
  // Fetch next rendez-vous
  const { data: nextRdv } = useQuery({
    queryKey: ['rendez-vous', 'next'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<RendezVous>>('/rendez-vous/next')
      return response.data.data
    },
  })

  // Fetch today's rendez-vous
  const { data: todayRdvs } = useQuery({
    queryKey: ['rendez-vous', 'today'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<RendezVous[]>>('/rendez-vous/today')
      return response.data.data
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getUserTitle = () => {
    if (!user) return ''
    const title = user.role === 'medecin' ? 'Dr. ' : ''
    return `${title}${user.prenom} ${user.nom}`
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Greeting Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {getGreeting()}, {getUserTitle()}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg">
              Voici un aperçu de votre cabinet médical
            </p>
          </div>
        </div>
        
        {/* Weather Widget */}
        <WeatherWidget />
      </div>

      {/* Next Appointment */}
      {nextRdv && nextRdv.patientId && (
        <Link
          to={`/dashboard/patients/${nextRdv.patientId._id}`}
          className="block group"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl shadow-sm border border-blue-200/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Prochain Rendez-vous</h2>
                  <p className="text-sm text-gray-600">{formatDate(nextRdv.date)}</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-600 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-blue-200 shadow-sm">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {nextRdv.patientId.prenom} {nextRdv.patientId.nom}
                </h3>
                <p className="text-sm text-gray-600">{nextRdv.motif}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(nextRdv.heureDebut)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(nextRdv.heureFin)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Today's Appointments */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/60 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Rendez-vous d'aujourd'hui</h2>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              {todayRdvs?.filter(rdv => rdv.patientId).length || 0}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200/60">
          {todayRdvs && todayRdvs.filter(rdv => rdv.patientId).length > 0 ? (
            todayRdvs.filter(rdv => rdv.patientId).map((rdv) => (
              <Link
                key={rdv._id}
                to="/dashboard/appointments"
                className="block hover:bg-gray-50/50 transition-colors duration-150 group"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-md text-white">
                        <span className="text-xl font-bold">{formatTime(rdv.heureDebut)}</span>
                        <span className="text-xs opacity-80">{formatTime(rdv.heureFin)}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {rdv.patientId.prenom} {rdv.patientId.nom}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          rdv.statut === 'confirme' 
                            ? 'bg-green-100 text-green-700' 
                            : rdv.statut === 'en-attente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rdv.statut}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{rdv.motif}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{rdv.patientId.telephone}</p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Aucun rendez-vous aujourd'hui</p>
              <p className="text-gray-400 text-sm mt-2">Profitez de cette journée tranquille !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
