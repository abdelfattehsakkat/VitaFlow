import { Home, Users, Calendar, UserCog, TrendingUp } from 'lucide-react'

export type UserRole = 'admin' | 'medecin' | 'assistant'

export interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[] // Rôles autorisés à voir ce menu
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    roles: ['admin', 'medecin', 'assistant'] // Tous
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/dashboard/patients',
    icon: Users,
    roles: ['admin', 'medecin', 'assistant'] // Tous
  },
  {
    id: 'calendrier',
    label: 'Calendrier',
    path: '/dashboard/appointments',
    icon: Calendar,
    roles: ['admin', 'medecin', 'assistant'] // Tous
  },
  {
    id: 'bilan',
    label: 'Bilan',
    path: '/dashboard/bilan',
    icon: TrendingUp,
    roles: ['admin', 'medecin', 'assistant'] // Tous
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    path: '/dashboard/users',
    icon: UserCog,
    roles: ['admin'] // Seulement admin
  }
]

/**
 * Filtre les menus selon le rôle de l'utilisateur
 */
export const getMenuItemsByRole = (userRole: UserRole): MenuItem[] => {
  return menuItems.filter(item => item.roles.includes(userRole))
}

/**
 * Vérifie si un utilisateur a accès à une route
 */
export const hasAccessToRoute = (path: string, userRole: UserRole): boolean => {
  const menuItem = menuItems.find(item => item.path === path)
  if (!menuItem) return false
  return menuItem.roles.includes(userRole)
}
