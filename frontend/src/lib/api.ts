import axios from 'axios'

// Détection automatique de l'URL de l'API
const getApiUrl = () => {
  // Si VITE_API_URL est défini, l'utiliser
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Sinon, détecter selon l'environnement
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api'
  }
  
  // En production, utiliser le même hostname avec le port 3001
  return `http://${hostname}:3001/api`
}

const API_BASE_URL = getApiUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, essayer de refresh
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const { accessToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)
          
          // Retry la requête originale
          error.config.headers.Authorization = `Bearer ${accessToken}`
          return api(error.config)
        } catch {
          // Refresh échoué, déconnecter l'utilisateur
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
