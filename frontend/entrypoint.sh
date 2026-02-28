#!/bin/sh

# Script pour remplacer les variables d'environnement au démarrage du conteneur
# Cela permet de configurer les variables au runtime au lieu du build time

set -e

# Valeur par défaut si VITE_API_URL n'est pas définie
DEFAULT_API_URL="http://localhost:3001/api"
API_URL="${VITE_API_URL:-$DEFAULT_API_URL}"

# Valeur par défaut si VITE_OPENWEATHER_API_KEY n'est pas définie
DEFAULT_WEATHER_KEY="YOUR_API_KEY_HERE"
WEATHER_KEY="${VITE_OPENWEATHER_API_KEY:-$DEFAULT_WEATHER_KEY}"

echo "Configuring frontend with API URL: $API_URL"
echo "Configuring frontend with OpenWeather API Key: ${WEATHER_KEY:0:8}..." # Afficher seulement les 8 premiers caractères

# Remplacer l'URL de l'API dans tous les fichiers JS
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|__VITE_API_URL_PLACEHOLDER__|$API_URL|g" {} \;

# Remplacer la clé OpenWeather dans tous les fichiers JS
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|__VITE_OPENWEATHER_API_KEY_PLACEHOLDER__|$WEATHER_KEY|g" {} \;

echo "Configuration complete"
