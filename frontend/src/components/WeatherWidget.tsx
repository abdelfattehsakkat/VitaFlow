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
  const iconClass = "h-12 w-12"
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return <Sun className={`${iconClass} text-yellow-500`} />
    case 'clouds':
      return <Cloud className={`${iconClass} text-gray-400`} />
    case 'rain':
      return <CloudRain className={`${iconClass} text-blue-500`} />
    case 'drizzle':
      return <CloudDrizzle className={`${iconClass} text-blue-400`} />
    case 'snow':
      return <CloudSnow className={`${iconClass} text-blue-200`} />
    case 'thunderstorm':
      return <Zap className={`${iconClass} text-yellow-600`} />
    case 'mist':
    case 'fog':
    case 'haze':
      return <CloudFog className={`${iconClass} text-gray-500`} />
    default:
      return <Wind className={`${iconClass} text-gray-400`} />
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
      <div className="bg-gradient-to-br from-sky-50 to-blue-100/50 rounded-xl border border-sky-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-sky-900/70">Météo</p>
            <p className="text-2xl font-bold text-sky-900 mt-1">{weatherConfig.city}</p>
            <p className="text-xs text-sky-700 mt-2">
              Configurez votre clé API OpenWeatherMap
            </p>
          </div>
          <div className="text-sky-600">
            <Sun className="h-12 w-12" />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-100/50 rounded-xl border border-sky-200 p-6">
        <div className="animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-sky-200 rounded w-16"></div>
            <div className="h-8 bg-sky-200 rounded w-24"></div>
            <div className="h-3 bg-sky-200 rounded w-32"></div>
          </div>
          <div className="h-12 w-12 bg-sky-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100/50 rounded-xl border border-sky-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-sky-900/70">Météo</p>
          <p className="text-3xl font-bold text-sky-900 mt-1">
            {Math.round(weather.main.temp)}°C
          </p>
          <p className="text-xs text-sky-700 mt-2 capitalize">
            {weather.weather[0].description}
          </p>
          <p className="text-xs text-sky-600 mt-1">
            {weather.name} • Ressenti {Math.round(weather.main.feels_like)}°C
          </p>
        </div>
        <div>
          {getWeatherIcon(weather.weather[0].main)}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-sky-200 flex items-center justify-between text-xs text-sky-700">
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          <span>{weather.wind.speed} m/s</span>
        </div>
        <div>
          <span>Humidité {weather.main.humidity}%</span>
        </div>
      </div>
    </div>
  )
}
