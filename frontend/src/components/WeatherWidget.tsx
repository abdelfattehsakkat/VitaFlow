import { useQuery } from '@tanstack/react-query'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudFog, Zap } from 'lucide-react'
import { weatherConfig } from '../config/weather.config'

interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
}

const getWeatherIcon = (weatherMain: string) => {
  const iconClass = "h-16 w-16 sm:h-20 sm:w-20"
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />
    case 'clouds':
      return <Cloud className={`${iconClass} text-gray-300 drop-shadow-lg`} />
    case 'rain':
      return <CloudRain className={`${iconClass} text-blue-400 drop-shadow-lg`} />
    case 'drizzle':
      return <CloudDrizzle className={`${iconClass} text-blue-300 drop-shadow-lg`} />
    case 'snow':
      return <CloudSnow className={`${iconClass} text-blue-200 drop-shadow-lg`} />
    case 'thunderstorm':
      return <Zap className={`${iconClass} text-yellow-500 drop-shadow-lg`} />
    case 'mist':
    case 'fog':
    case 'haze':
      return <CloudFog className={`${iconClass} text-gray-400 drop-shadow-lg`} />
    default:
      return <Wind className={`${iconClass} text-gray-300 drop-shadow-lg`} />
  }
}

export default function WeatherWidget() {
  const { data: weather, isLoading, isError } = useQuery<WeatherData>({
    queryKey: ['weather', weatherConfig.city],
    queryFn: async () => {
      // Si pas de clé API configurée, on ne fait pas la requête
      if (weatherConfig.apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('API key not configured')
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${weatherConfig.city},${weatherConfig.country}&appid=${weatherConfig.apiKey}&units=${weatherConfig.units}&lang=${weatherConfig.lang}`
      )
      
      if (!response.ok) {
        throw new Error('Weather fetch failed')
      }
      
      return response.json()
    },
    refetchInterval: 1800000, // Rafraîchir toutes les 30 minutes
    retry: false,
    enabled: weatherConfig.apiKey !== 'YOUR_API_KEY_HERE'
  })

  // Si la clé API n'est pas configurée, afficher un widget par défaut
  if (weatherConfig.apiKey === 'YOUR_API_KEY_HERE' || isError) {
    return (
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-xl border border-sky-400/30 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-sky-100 mb-1">Météo</p>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">24°C</p>
              <p className="text-sm text-sky-100 capitalize mb-1">Ciel Dégagé</p>
              <p className="text-xs text-sky-200">
                {weatherConfig.city} • Ressenti 23°C
              </p>
            </div>
            <div className="animate-pulse">
              <Sun className="h-20 w-20 text-yellow-300 drop-shadow-2xl" />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-sm text-sky-100">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              <span>5.06 m/s</span>
            </div>
            <div>
              <span>Humidité 21%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-xl border border-sky-400/30 p-6 sm:p-8">
        <div className="animate-pulse flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-white/20 rounded w-16"></div>
            <div className="h-12 bg-white/20 rounded w-24"></div>
            <div className="h-3 bg-white/20 rounded w-32"></div>
          </div>
          <div className="h-20 w-20 bg-white/20 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-xl border border-sky-400/30 p-6 sm:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-sky-100 mb-1">Météo</p>
            <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {Math.round(weather.main.temp)}°C
            </p>
            <p className="text-sm text-sky-100 capitalize mb-1">
              {weather.weather[0].description}
            </p>
            <p className="text-xs text-sky-200">
              {weather.name} • Ressenti {Math.round(weather.main.feels_like)}°C
            </p>
          </div>
          <div className="animate-bounce" style={{ animationDuration: '3s' }}>
            {getWeatherIcon(weather.weather[0].main)}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-sm text-sky-100">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <span>{weather.wind.speed} m/s</span>
          </div>
          <div>
            <span>Humidité {weather.main.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
