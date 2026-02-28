import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingDown, DollarSign, Calendar, Plus, Search, Edit2, Trash2, AlertCircle, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import api from '../lib/api'
import type { ApiResponse, PaginationMeta } from '../types'

interface ChargesStats {
  jour: {
    totalMontant: number
    nombreCharges: number
  }
  semaine: {
    totalMontant: number
    nombreCharges: number
  }
  mois: {
    totalMontant: number
    nombreCharges: number
  }
}

interface Charge {
  _id: string
  date: string
  motif: string
  montant: number
  createdAt: string
  updatedAt: string
}

interface ChargesResponse {
  charges: Charge[]
  pagination: PaginationMeta
}

interface MonthlyChargeData {
  year: number
  month: number
  monthName: string
  totalMontant: number
  nombreCharges: number
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
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
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

export default function ChargesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)
  const [viewMode, setViewMode] = useState<'monthly' | 'history'>('history')
  const limit = 10

  // Fetch quick stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['charges-stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ChargesStats>>('/charges/stats')
      return response.data.data
    },
  })

  // Fetch charges
  const { data, isLoading } = useQuery({
    queryKey: ['charges', searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      })
      const response = await api.get<ApiResponse<ChargesResponse>>(
        `/charges?${params}`
      )
      return response.data.data
    },
  })

  // Fetch monthly evolution
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['charges-monthly'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<MonthlyChargeData[]>>('/charges/monthly')
      return response.data.data
    },
  })

  // Delete charge mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/charges/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      queryClient.invalidateQueries({ queryKey: ['charges-stats'] })
    },
  })

  const handleDelete = (charge: Charge) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette charge : ${charge.motif} ?`)) {
      deleteMutation.mutate(charge._id)
    }
  }

  const handleEdit = (charge: Charge) => {
    setSelectedCharge(charge)
    setShowForm(true)
  }

  const handleAdd = () => {
    setSelectedCharge(null)
    setShowForm(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (showForm) {
    return <ChargeForm charge={selectedCharge} onClose={() => setShowForm(false)} />
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 sm:gap-6">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <TrendingDown className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">Charges</h1>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
                Gérez les dépenses et charges du cabinet
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            className="group flex items-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium text-sm sm:text-base"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            <span className="hidden sm:inline">Charge</span>
          </button>
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
            value={formatCurrency(stats.jour.totalMontant)}
            icon={DollarSign}
            color="red"
            subtext={`${stats.jour.nombreCharges} charge${stats.jour.nombreCharges > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Cette Semaine"
            value={formatCurrency(stats.semaine.totalMontant)}
            icon={Calendar}
            color="orange"
            subtext={`${stats.semaine.nombreCharges} charge${stats.semaine.nombreCharges > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Ce Mois"
            value={formatCurrency(stats.mois.totalMontant)}
            icon={TrendingDown}
            color="amber"
            subtext={`${stats.mois.nombreCharges} charge${stats.mois.nombreCharges > 1 ? 's' : ''}`}
          />
        </div>
      ) : null}

      {/* View Toggle Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setViewMode('monthly')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
            viewMode === 'monthly'
              ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/80 text-gray-700 border border-gray-200/60 hover:bg-gray-50'
          }`}
        >
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Évolution sur 12 Mois</span>
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
            viewMode === 'history'
              ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/80 text-gray-700 border border-gray-200/60 hover:bg-gray-50'
          }`}
        >
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Historique des Charges</span>
        </button>
      </div>

      {/* Search Bar (only in history mode) */}
      {viewMode === 'history' && (
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par motif..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/60 focus:bg-white transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Monthly Evolution Table */}
      {viewMode === 'monthly' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200/60 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-gray-600" />
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
                      Nombre de Charges
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Montant Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {monthly.map((month, index) => {
                    const isCurrentMonth = index === 0
                    return (
                      <tr 
                        key={`${month.year}-${month.month}`}
                        className={`hover:bg-gray-50/50 transition-all duration-150 ${isCurrentMonth ? 'bg-red-50/30' : ''}`}
                      >
                        <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isCurrentMonth && (
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            )}
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {month.monthName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-900">{month.nombreCharges}</span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-red-600">
                            {formatCurrency(month.totalMontant)}
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
                      <span className="text-sm font-bold text-gray-900">
                        {monthly?.reduce((sum, m) => sum + m.nombreCharges, 0)}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6 text-right">
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(monthly?.reduce((sum, m) => sum + m.totalMontant, 0) || 0)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* History Charges Table */}
      {viewMode === 'history' && (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200/60 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Historique des Charges</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : !data?.charges.length ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucune charge trouvée pour cette recherche' : 'Aucune charge enregistrée'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200/60">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Motif
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {data.charges.map((charge) => (
                    <tr 
                      key={charge._id}
                      className="hover:bg-gray-50/50 transition-all duration-150 group"
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDate(charge.date)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {charge.motif}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(charge.montant)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1 sm:gap-1.5">
                          <button
                            onClick={() => handleEdit(charge)}
                            className="p-2 text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-150 hover:scale-105"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(charge)}
                            className="p-2 text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-150 hover:scale-105"
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
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="px-3 py-3 sm:px-6 sm:py-4 border-t border-gray-200/60 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Page {data.pagination.page}/{data.pagination.totalPages} · {data.pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={data.pagination.page === 1}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200/60 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-sm"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={data.pagination.page === data.pagination.totalPages}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200/60 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-sm"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  )
}

// Charge Form Component (Add/Edit)
function ChargeForm({ charge, onClose }: { charge: Charge | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    date: charge?.date.split('T')[0] || new Date().toISOString().split('T')[0],
    motif: charge?.motif || '',
    montant: charge?.montant || 0,
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (charge) {
        return api.patch(`/charges/${charge._id}`, data)
      } else {
        return api.post('/charges', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      queryClient.invalidateQueries({ queryKey: ['charges-stats'] })
      onClose()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Une erreur est survenue')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.motif.trim()) {
      alert('Le motif est requis')
      return
    }
    
    if (formData.montant <= 0) {
      alert('Le montant doit être supérieur à 0')
      return
    }
    
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: name === 'montant' ? parseFloat(value) || 0 : value })
  }

  return (
    <div className="max-w-2xl px-2 sm:px-0">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {charge ? 'Modifier Charge' : 'Nouvelle Charge'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={mutation.isPending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Ex: Loyer, Électricité, Fournitures..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (TND) *</label>
              <input
                type="number"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50"
            >
              {mutation.isPending ? 'Enregistrement...' : charge ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
