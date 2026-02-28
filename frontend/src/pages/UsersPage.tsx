import { UserCog } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCog className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-sm text-gray-500">Gestion des utilisateurs du système</p>
          </div>
        </div>
      </div>

      {/* Contenu - À développer */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <UserCog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Gestion des utilisateurs
        </h2>
        <p className="text-gray-500">
          Cette fonctionnalité sera développée prochainement
        </p>
      </div>
    </div>
  )
}
