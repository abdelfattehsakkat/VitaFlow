import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, Scale } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '../lib/api'
import type { ApiResponse } from '../types'

interface BilanFinalStats {
  mois: {
    revenus: number
    charges: number
    benefice: number
    nombreSoins: number
    nombreCharges: number
  }
}

interface MonthlyBilanData {
  year: number
  month: number
  monthName: string
  revenus: number
  charges: number
  benefice: number
  nombreSoins: number
  nombreCharges: number
}

// StatCard component
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
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
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

export default function BilanFinalPage() {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount)
  }

  // Fetch stats for current month
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bilan-final-stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<BilanFinalStats>>('/bilan-final/stats')
      return response.data.data
    },
  })

  // Fetch monthly bilan
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['bilan-final-monthly'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MonthlyBilanData[]>>('/bilan-final/monthly')
      return response.data.data
    },
  })

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-6">
        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Scale className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">Bilan Financier</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            Vue d'ensemble du bénéfice net (Revenus - Charges)
          </p>
        </div>
      </div>

      {/* Stats Card for Current Month */}
      {statsLoading ? (
        <div className="bg-white/80 rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Revenus du Mois"
            value={formatCurrency(stats.mois.revenus)}
            icon={TrendingUp}
            color="green"
            subtext={`${stats.mois.nombreSoins} soin${stats.mois.nombreSoins > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Charges du Mois"
            value={formatCurrency(stats.mois.charges)}
            icon={TrendingDown}
            color="red"
            subtext={`${stats.mois.nombreCharges} charge${stats.mois.nombreCharges > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Bénéfice Net"
            value={formatCurrency(stats.mois.benefice)}
            icon={DollarSign}
            color={stats.mois.benefice >= 0 ? 'blue' : 'red'}
            subtext={stats.mois.benefice >= 0 ? 'Positif' : 'Négatif'}
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
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Charges
                  </th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bénéfice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {monthly.map((month, index) => {
                  const isCurrentMonth = index === 0
                  const isBeneficePositif = month.benefice >= 0
                  return (
                    <tr 
                      key={`${month.year}-${month.month}`}
                      className={`hover:bg-gray-50/50 transition-all duration-150 ${isCurrentMonth ? 'bg-purple-50/30' : ''}`}
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isCurrentMonth && (
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                          )}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {month.monthName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(month.revenus)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(month.charges)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold ${isBeneficePositif ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(month.benefice)}
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
                  <td className="px-3 py-4 sm:px-6 text-right">
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.revenus, 0) || 0)}
                    </span>
                  </td>
                  <td className="px-3 py-4 sm:px-6 text-right">
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.charges, 0) || 0)}
                    </span>
                  </td>
                  <td className="px-3 py-4 sm:px-6 text-right">
                    <span className={`text-sm font-bold ${
                      (monthly?.reduce((sum, m) => sum + m.benefice, 0) || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(monthly?.reduce((sum, m) => sum + m.benefice, 0) || 0)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50/50 backdrop-blur-xl rounded-2xl border border-purple-200/60 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-900 mb-1">À propos du bilan</h3>
            <p className="text-sm text-purple-800">
              Le bénéfice net est calculé en soustrayant les charges des revenus (montants reçus). 
              Un bénéfice positif (en bleu) indique un excédent, tandis qu'un bénéfice négatif (en rouge) indique un déficit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
