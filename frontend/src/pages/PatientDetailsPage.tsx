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
} from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { Patient, ApiResponse, Soin } from '../types'

export default function PatientDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showSoinForm, setShowSoinForm] = useState(false)
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

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
          <div className="divide-y divide-gray-200/60">
            {patient.soins
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((soin) => (
                <div key={soin._id} className="p-6 hover:bg-gray-50/50 transition-colors duration-150 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900">Consultation du {formatDate(soin.date)}</h3>
                      </div>
                      {soin.description && <p className="text-gray-600 mb-4 leading-relaxed">{soin.description}</p>}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Honoraire:</span>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg">{soin.honoraire.toFixed(2)} TND</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Reçu:</span>
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 font-semibold rounded-lg">{soin.recu.toFixed(2)} TND</span>
                        </div>
                        {soin.medecinNom && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Médecin:</span>
                            <span className="font-medium text-gray-900">{soin.medecinNom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleEditSoin(soin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg hover:scale-105 transition-all duration-150"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSoin(soin)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg hover:scale-105 transition-all duration-150"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
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
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    date: soin?.date.split('T')[0] || new Date().toISOString().split('T')[0],
    description: soin?.description || '',
    honoraire: soin?.honoraire.toString() || '',
    recu: soin?.recu.toString() || '',
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        honoraire: parseFloat(data.honoraire),
        recu: parseFloat(data.recu),
        medecinId: user?.id,
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Honoraire (TND) *</label>
              <input
                type="number"
                name="honoraire"
                value={formData.honoraire}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Montant Reçu (TND) *</label>
              <input
                type="number"
                name="recu"
                value={formData.recu}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
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
