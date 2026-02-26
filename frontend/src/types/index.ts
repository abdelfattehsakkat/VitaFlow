interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: 'admin' | 'medecin' | 'assistant'
  isActive: boolean
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface Soin {
  _id: string
  date: string
  description: string
  honoraire: number
  recu: number
  medecinId?: string
  medecinNom?: string
  createdAt: string
}

interface Patient {
  _id: string
  id: number
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email?: string
  adresse?: string
  mutuelle?: string
  numeroMutuelle?: string
  antecedents?: string
  soins: Soin[]
  totalHonoraires?: number
  totalRecu?: number
  createdAt: string
  updatedAt: string
}

interface RendezVous {
  _id: string
  patient: string | Patient
  medecin: string | User
  dateDebut: string
  dateFin: string
  titre: string
  description?: string
  statut: 'planifie' | 'confirme' | 'termine' | 'annule'
  priorite?: 'basse' | 'normale' | 'haute' | 'urgente'
  createdAt: string
  updatedAt: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type { User, AuthResponse, ApiResponse, Patient, Soin, RendezVous, PaginationMeta }
