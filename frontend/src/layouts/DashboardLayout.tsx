import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-blue-600">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-white">VitaFlow</h1>
            </div>
            <div className="mt-8 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <Link
                  to="/dashboard"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/dashboard/patients"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/dashboard/patients')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  👥 Patients
                </Link>
                <Link
                  to="/dashboard/appointments"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/dashboard/appointments')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  📅 Rendez-vous
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-500 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs font-medium text-blue-200">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="mt-3 w-full text-left text-sm text-blue-100 hover:text-white"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
