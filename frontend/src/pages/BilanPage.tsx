import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '../lib/api'
import type { ApiResponse } from '../types'

interface BilanStats {
  jour: {
    totalHonoraires: number
    totalRecu: number
    nombreSoins: number
  }
  semaine: {
    totalHonoraires: number
    totalRecu: number
    nombreSoins: number
  }
  mois: {
    totalHonoraires: number
    totalRecu: number
    nombreSoins: number
  }
}

interface MonthlyData {
  year: number
  month: number
  monthName: string
  totalHonoraires: number
  totalRecu: number
  nombreSoins: number
  nombrePatients: number
  resteAPayer: number
}

// StatCard component outside of render
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtext 
}: { 
  title: string
  value: string
  icon: LucideIcon
  color: string
  subtext?: string 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtext && (
            <p className="text-xs sm:text-sm text-gray-500">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function BilanPage() {
  // Fetch quick stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bilan-stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<BilanStats>>('/bilan/stats')
      return response.data.data
    },
  })

  // Fetch monthly data
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['bilan-monthly'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MonthlyData[]>>('/bilan/monthly')
      return response.data.data
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-6">
        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
          <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">Bilan Comptable</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            Vue d'ensemble des revenus et statistiques financières du cabinet
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Aujourd'hui"
            value={formatCurrency(stats.jour.totalRecu)}
            icon={DollarSign}
            color="blue"
            subtext={`${stats.jour.nombreSoins} soins • Honoraires: ${formatCurrency(stats.jour.totalHonoraires)}`}
          />
          <StatCard
            title="Cette Semaine"
            value={formatCurrency(stats.semaine.totalRecu)}
            icon={Calendar}
            color="purple"
            subtext={`${stats.semaine.nombreSoins} soins • Honoraires: ${formatCurrency(stats.semaine.totalHonoraires)}`}
          />
          <StatCard
            title="Ce Mois"
            value={formatCurrency(stats.mois.totalRecu)}
            icon={TrendingUp}
            color="green"
            subtext={`${stats.mois.nombreSoins} soins • Honoraires: ${formatCurrency(stats.mois.totalHonoraires)}`}
          />
        </div>
      ) : null}

      {/* Monthly Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200/60 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Évolution sur 12 Mois</h2>
          </div>
        </div>

        {monthlyLoading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : !monthly?.length ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200/60">
                <tr>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mois
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Soins
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patients
                  </th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Honoraires
                  </th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reçu
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reste à Payer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {monthly.map((month, index) => {
                  const isCurrentMonth = index === 0
                  return (
                    <tr 
                      key={`${month.year}-${month.month}`}
                      className={`hover:bg-gray-50/50 transition-all duration-150 ${isCurrentMonth ? 'bg-green-50/30' : ''}`}
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isCurrentMonth && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          )}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {month.monthName}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">{month.nombreSoins}</span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">{month.nombrePatients}</span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(month.totalHonoraires)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(month.totalRecu)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${month.resteAPayer > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {formatCurrency(month.resteAPayer)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50/80 border-t-2 border-gray-300">
                <tr>
                  <td className="px-3 py-4 sm:px-6 text-left">
                    <span className="text-sm font-bold text-gray-900">TOTAL</span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {monthly?.reduce((sum, m) => sum + m.nombreSoins, 0)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {/* Unique patients across all months */}
                      {monthly?.reduce((sum, m) => sum + m.nombrePatients, 0)}
                    </span>
                  </td>
                  <td className="px-3 py-4 sm:px-6 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.totalHonoraires, 0) || 0)}
                    </span>
                  </td>
                  <td className="px-3 py-4 sm:px-6 text-right">
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.totalRecu, 0) || 0)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-right">
                    <span className="text-sm font-bold text-orange-600">
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.resteAPayer, 0) || 0)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50/50 backdrop-blur-xl rounded-2xl border border-blue-200/60 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">À propos des statistiques</h3>
            <p className="text-sm text-blue-800">
              Les revenus sont calculés à partir des honoraires et montants reçus enregistrés dans les soins des patients. 
              Le "Reste à Payer" représente la différence entre les honoraires facturés et les montants effectivement reçus.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
