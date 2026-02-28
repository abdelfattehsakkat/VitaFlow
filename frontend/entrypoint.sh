#!/bin/sh

# Script pour remplacer l'URL de l'API au démarrage du conteneur
# Cela permet de configurer VITE_API_URL au runtime au lieu du build time

set -e

# Valeur par défaut si VITE_API_URL n'est pas définie
DEFAULT_API_URL="http://localhost:3001/api"
API_URL="${VITE_API_URL:-$DEFAULT_API_URL}"

echo "Configuring frontend with API URL: $API_URL"

# Remplacer l'URL de l'API dans tous les fichiers JS
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|__VITE_API_URL_PLACEHOLDER__|$API_URL|g" {} \;

echo "API URL configuration complete"
