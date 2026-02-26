export const weatherConfig = {
  // Ville par défaut pour la météo
  city: 'Tunis',
  country: 'TN',
  
  // API OpenWeatherMap (clé gratuite - remplacer par la vôtre)
  // Inscription gratuite sur: https://openweathermap.org/api
  // La clé API est stockée dans .env.local (non commité)
  apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE',
  
  // Unités de mesure
  units: 'metric', // metric pour Celsius, imperial pour Fahrenheit
  
  // Langue
  lang: 'fr'
}
