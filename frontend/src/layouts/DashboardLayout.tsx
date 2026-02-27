import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, Users, Calendar, LogOut, User } from 'lucide-react'

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">VitaFlow</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-4 flex-1 flex flex-col px-4">
              <nav className="flex-1 space-y-2">
                <Link
                  to="/dashboard"
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${
                    location.pathname === '/dashboard' ? '' : 'group-hover:scale-110'
                  }`} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/dashboard/patients"
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/patients')
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Users className={`w-5 h-5 transition-transform duration-200 ${
                    isActive('/dashboard/patients') ? '' : 'group-hover:scale-110'
                  }`} />
                  <span>Patients</span>
                </Link>
                
                <Link
                  to="/dashboard/appointments"
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/appointments')
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Calendar className={`w-5 h-5 transition-transform duration-200 ${
                    isActive('/dashboard/appointments') ? '' : 'group-hover:scale-110'
                  }`} />
                  <span>Rendez-vous</span>
                </Link>
              </nav>
            </div>
            
            {/* User Section */}
            <div className="flex-shrink-0 mt-auto border-t border-slate-700/50 mx-4">
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="group mt-3 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Déconnexion</span>
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
