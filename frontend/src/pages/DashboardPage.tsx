import { useQuery } from '@tanstack/react-query'
import { Users, Calendar, DollarSign, Stethoscope, CalendarCheck, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import WeatherWidget from '../components/WeatherWidget'
import api from '../lib/api'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: async () => {
      const response = await api.get('/stats/overview')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {getUserTitle()}
          </h1>
          <p className="text-gray-600 text-lg">
            Voici un aperçu de votre cabinet médical
          </p>
        </div>
        
        <WeatherWidget />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Patients */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 overflow-hidden rounded-xl border border-cyan-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <Users className="h-8 w-8 text-cyan-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyan-900/70 truncate">
                    Total Patients
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-cyan-900">
                    {stats?.totalPatients || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* RDV ce mois */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 overflow-hidden rounded-xl border border-violet-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <Calendar className="h-8 w-8 text-violet-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-violet-900/70 truncate">
                    RDV ce mois
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-violet-900">
                    {stats?.rendezVousMonth || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Revenus du mois */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 overflow-hidden rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-emerald-900/70 truncate">
                    Revenus du mois
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-emerald-900">
                    {stats?.revenueMonth?.toLocaleString('fr-TN') || 0} TND
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Médecins */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 overflow-hidden rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <Stethoscope className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-indigo-900/70 truncate">
                    Médecins
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-indigo-900">
                    {stats?.totalMedecins || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* RDV aujourd'hui */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 overflow-hidden rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <CalendarCheck className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-900/70 truncate">
                    RDV aujourd'hui
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-amber-900">
                    {stats?.rendezVousToday || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Nouveaux patients */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 overflow-hidden rounded-xl border border-rose-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
                <UserPlus className="h-8 w-8 text-rose-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-rose-900/70 truncate">
                    Nouveaux patients
                  </dt>
                  <dd className="mt-1 text-3xl font-bold text-rose-900">
                    {stats?.patientsThisMonth || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
