import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Wallet,
} from 'lucide-react'
import api from '../lib/api'
import type { Patient, ApiResponse, Soin } from '../types'

export default function PatientDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showSoinForm, setShowSoinForm] = useState(false)
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showSoinDetail, setShowSoinDetail] = useState(false)
  const [selectedSoinDetail, setSelectedSoinDetail] = useState<Soin | null>(null)

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`)
      return response.data.data
    },
  })

  const deleteSoinMutation = useMutation({
    mutationFn: async (soinId: string) => {
      await api.delete(`/patients/${id}/soins/${soinId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] })
    },
  })

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleDeleteSoin = (soin: Soin) => {
    if (confirm(`Supprimer la consultation du ${formatDate(soin.date)} ?`)) {
      deleteSoinMutation.mutate(soin._id)
    }
  }

  const handleEditSoin = (soin: Soin) => {
    setSelectedSoin(soin)
    setShowSoinForm(true)
  }

  const handleAddSoin = () => {
    setSelectedSoin(null)
    setShowSoinForm(true)
  }

  const handleViewSoin = (soin: Soin) => {
    setSelectedSoinDetail(soin)
    setShowSoinDetail(true)
  }

  if (showEditForm && patient) {
    return (
      <PatientForm
        patient={patient}
        onClose={() => setShowEditForm(false)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient introuvable</p>
        <button onClick={() => navigate('/dashboard/patients')} className="mt-4 text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    )
  }

  if (showSoinForm) {
    return (
      <SoinForm
        patientId={patient._id}
        soin={selectedSoin}
        onClose={() => {
          setShowSoinForm(false)
          setSelectedSoin(null)
        }}
      />
    )
  }

  if (showSoinDetail && selectedSoinDetail) {
    return (
      <SoinDetailView
        soin={selectedSoinDetail}
        patientName={`${patient.nom} ${patient.prenom}`}
        onClose={() => {
          setShowSoinDetail(false)
          setSelectedSoinDetail(null)
        }}
        onEdit={() => {
          setShowSoinDetail(false)
          handleEditSoin(selectedSoinDetail)
        }}
        onDelete={() => {
          setShowSoinDetail(false)
          handleDeleteSoin(selectedSoinDetail)
        }}
        formatDate={formatDate}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/patients')}
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 duration-150" />
          <span className="font-medium">Retour</span>
        </button>
        <button
          onClick={() => setShowEditForm(true)}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium"
        >
          <Edit2 className="w-4 h-4 transition-transform group-hover:rotate-12 duration-200" />
          Modifier
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                {patient.nom} {patient.prenom}
              </h1>
              <span className="px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200/60">
                {patient.id}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {patient.dateNaissance && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date de naissance</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(patient.dateNaissance)} ({calculateAge(patient.dateNaissance)} ans)
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="text-sm font-medium text-gray-900">{patient.telephone}</p>
                </div>
              </div>
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                  </div>
                </div>
              )}
              {patient.adresse && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium text-gray-900">{patient.adresse}</p>
                  </div>
                </div>
              )}
              {patient.mutuelle && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Mutuelle</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.mutuelle}
                      {patient.numeroMutuelle && ` - ${patient.numeroMutuelle}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {patient.antecedents && (
          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Antécédents médicaux</h3>
            </div>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{patient.antecedents}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <p className="text-sm font-medium text-gray-500">Total Consultations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{patient.soins.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <p className="text-sm font-medium text-gray-500">Total Honoraires</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{patient.totalHonoraires?.toFixed(2)} TND</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <p className="text-sm font-medium text-gray-500">Total Reçu</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{patient.totalRecu?.toFixed(2)} TND</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <p className="text-sm font-medium text-gray-500">Balance</p>
          <p className={`text-3xl font-bold mt-2 ${
            (patient.totalRecu || 0) - (patient.totalHonoraires || 0) < 0 
              ? 'text-red-500' 
              : 'text-green-500'
          }`}>
            {((patient.totalRecu || 0) - (patient.totalHonoraires || 0)).toFixed(2)} TND
          </p>
        </div>
      </div>

      {/* Consultations History */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60">
        <div className="px-6 py-5 border-b border-gray-200/60 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Historique des Consultations</h2>
          <button
            onClick={handleAddSoin}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            Nouvelle Consultation
          </button>
        </div>

        {patient.soins.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-lg">Aucune consultation enregistrée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Honoraire</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Reçu</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patient.soins
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((soin) => (
                    <tr 
                      key={soin._id} 
                      onClick={() => handleViewSoin(soin)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatDate(soin.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {soin.dent || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                        {soin.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg">
                          {soin.honoraire.toFixed(2)} TND
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 font-semibold rounded-lg">
                          {soin.recu.toFixed(2)} TND
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSoin(soin)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSoin(soin)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
        )}
      </div>
    </div>
  )
}

// Soin Detail View Component (Read-only)
function SoinDetailView({
  soin,
  patientName,
  onClose,
  onEdit,
  onDelete,
  formatDate,
}: {
  soin: Soin
  patientName: string
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  formatDate: (date: string) => string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Retour</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Consultation
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Patient: {patientName}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl transition-all text-white"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-xl rounded-xl transition-all text-white"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Date & Dent Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">Date</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatDate(soin.date)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-purple-900">Dent</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {soin.dent || '-'}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Description</span>
              </div>
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {soin.description || 'Aucune description'}
              </p>
            </div>

            {/* Financial Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">Honoraire</span>
                </div>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {soin.honoraire.toFixed(2)} TND
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-900">Montant Reçu</span>
                </div>
                <p className="text-3xl font-bold text-green-700 mt-2">
                  {soin.recu.toFixed(2)} TND
                </p>
              </div>
            </div>

            {/* Balance Section */}
            {soin.honoraire !== soin.recu && (
              <div className={`rounded-2xl p-6 border ${
                soin.recu < soin.honoraire 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200' 
                  : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${
                    soin.recu < soin.honoraire ? 'text-orange-900' : 'text-green-900'
                  }`}>
                    {soin.recu < soin.honoraire ? 'Reste à payer' : 'Surplus payé'}
                  </span>
                  <p className={`text-2xl font-bold ${
                    soin.recu < soin.honoraire ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {Math.abs(soin.honoraire - soin.recu).toFixed(2)} TND
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-white transition-all font-medium text-gray-700"
            >
              Fermer
            </button>
            <div className="flex gap-3">
              <button
                onClick={onDelete}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Soin Form Component
function SoinForm({
  patientId,
  soin,
  onClose,
}: {
  patientId: string
  soin: Soin | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    date: soin?.date.split('T')[0] || new Date().toISOString().split('T')[0],
    dent: soin?.dent || '',
    description: soin?.description || '',
    honoraire: soin?.honoraire.toString() || '',
    recu: soin?.recu.toString() || '',
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        date: data.date,
        dent: data.dent || undefined,
        description: data.description,
        honoraire: data.honoraire ? parseFloat(data.honoraire) : 0,
        recu: data.recu ? parseFloat(data.recu) : 0,
      }
      if (soin) {
        return api.patch(`/patients/${patientId}/soins/${soin._id}`, payload)
      } else {
        return api.post(`/patients/${patientId}/soins`, payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60">
        <div className="px-6 py-5 border-b border-gray-200/60 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {soin ? 'Modifier Consultation' : 'Nouvelle Consultation'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-150" 
            disabled={mutation.isPending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dent</label>
              <input
                type="text"
                name="dent"
                value={formData.dent}
                onChange={handleChange}
                placeholder="Ex: 11, 21, 36..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Détails de la consultation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Honoraire (TND)</label>
              <input
                type="number"
                name="honoraire"
                value={formData.honoraire}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Montant Reçu (TND)</label>
              <input
                type="number"
                name="recu"
                value={formData.recu}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200/60 rounded-xl text-red-700 text-sm">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

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
              className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {mutation.isPending ? 'Enregistrement...' : soin ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Patient Form Component (Edit)
function PatientForm({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    nom: patient?.nom || '',
    prenom: patient?.prenom || '',
    dateNaissance: patient?.dateNaissance?.split('T')[0] || '',
    telephone: patient?.telephone || '',
    email: patient?.email || '',
    adresse: patient?.adresse || '',
    mutuelle: patient?.mutuelle || '',
    numeroMutuelle: patient?.numeroMutuelle || '',
    antecedents: patient?.antecedents || '',
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.patch(`/patients/${patient._id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patient._id] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60">
        <div className="px-6 py-5 border-b border-gray-200/60 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Modifier Patient
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-150"
            disabled={mutation.isPending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Identification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Informations Personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date de Naissance *</label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* Mutuelle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Mutuelle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom Mutuelle</label>
                <input
                  type="text"
                  name="mutuelle"
                  value={formData.mutuelle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro Mutuelle</label>
                <input
                  type="text"
                  name="numeroMutuelle"
                  value={formData.numeroMutuelle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* Antecedents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Antécédents Médicaux</h3>
            <textarea
              name="antecedents"
              value={formData.antecedents}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 resize-none"
              placeholder="Allergies, maladies chroniques, antécédents familiaux..."
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
              className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {mutation.isPending ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
