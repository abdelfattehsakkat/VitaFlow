import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, User as UserIcon, UserCog, Shield, Calendar } from 'lucide-react'
import api from '../lib/api'
import type { User, ApiResponse, PaginationMeta } from '../types'

interface UsersResponse {
  users: User[]
  pagination: PaginationMeta
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const limit = 10

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['users', searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      })
      const response = await api.get<ApiResponse<UsersResponse>>(
        `/users?${params}`
      )
      return response.data.data
    },
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleDelete = (user: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setShowForm(true)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      medecin: 'bg-blue-100 text-blue-700 border-blue-200',
      assistant: 'bg-green-100 text-green-700 border-green-200',
    }
    const labels = {
      admin: 'Admin',
      medecin: 'Médecin',
      assistant: 'Assistant',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    )
  }

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
    if (role === 'medecin') return <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
    return <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (showForm) {
    return <UserForm user={selectedUser} onClose={() => setShowForm(false)} />
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header - Enhanced Premium Style */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 sm:gap-6">
            {/* Icon Badge */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <UserCog className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">Utilisateurs</h1>
                {data && (
                  <span className="px-2 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 text-xs sm:text-sm font-semibold rounded-full border border-purple-200/60 shadow-sm">
                    {data.pagination.total}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
                Gérez les comptes utilisateurs, leurs rôles et permissions
              </p>
              
              {/* Quick Stats */}
              {data && data.users.length > 0 && (
                <div className="flex items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium">{data.users.length}</span>
                    <span className="text-gray-400">sur cette page</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span>Page {data.pagination.page} / {data.pagination.totalPages}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            className="group flex items-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium text-sm sm:text-base"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            <span className="hidden sm:inline">Utilisateur</span>
          </button>
        </div>

        {/* Search Bar - Integrated */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/60 focus:bg-white transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : !data?.users.length ? (
          <div className="p-12 text-center text-gray-500">
            {searchTerm ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur enregistré'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200/60">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      N°
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nom & Prénom
                    </th>
                    <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Création
                    </th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {data.users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50/50 transition-all duration-150 group"
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {(data.pagination.page - 1) * limit + index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {user.nom} {user.prenom}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.telephone || 'N/A'}</span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full border border-green-200">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full border border-red-200">
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1 sm:gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(user)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50/80 rounded-lg transition-all duration-150 hover:scale-105"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(user)
                            }}
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
    </div>
  )
}

// User Form Component (Add/Edit)
function UserForm({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    role: user?.role || 'assistant',
    telephone: user?.telephone || '',
    isActive: user?.isActive ?? true,
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (user) {
        // Don't send empty password on update
        const updateData: Record<string, unknown> = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        return api.patch(`/users/${user.id}`, updateData)
      } else {
        return api.post('/users', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Une erreur est survenue')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!user && formData.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData({ ...formData, [name]: val })
  }

  return (
    <div className="max-w-3xl px-2 sm:px-0">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
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
          {/* Informations Personnelles */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Informations Personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {user ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={user ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rôle et Statut */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Rôle et Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="assistant">Assistant</option>
                  <option value="medecin">Médecin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Compte actif
                  </span>
                </label>
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {mutation.isPending ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

