import { useState, useMemo } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, User, Menu, X } from 'lucide-react'
import { getMenuItemsByRole } from '../config/menu.config'

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filtrer les menus selon le rôle de l'utilisateur
  const menuItems = useMemo(() => {
    if (!user?.role) return []
    return getMenuItemsByRole(user.role)
  }, [user?.role])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">VitaFlow</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-[57px] left-0 bottom-0 z-30 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-4 pb-4 overflow-y-auto">
          {/* Navigation */}
          <div className="flex-1 px-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${
                      active ? '' : 'group-hover:scale-110'
                    }`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* User Section */}
          <div className="flex-shrink-0 border-t border-slate-700/50 mx-4 pt-4">
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
              onClick={() => {
                logout()
                closeMobileMenu()
              }}
              className="group mt-3 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Sidebar */}
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
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${
                        active ? '' : 'group-hover:scale-110'
                      }`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
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
          <div className="py-4 sm:py-6 pt-16 md:pt-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
