#!/bin/bash
# Script de vérification Docker sur VPS
# À exécuter sur le VPS pour diagnostiquer les problèmes de pull d'images

echo "🔍 Vérification de la configuration Docker sur VPS"
echo ""

# 1. Vérifier l'authentification Docker
echo "1️⃣ Authentification Docker Registry"
echo "════════════════════════════════════"
if [ -f ~/.docker/config.json ]; then
    echo "✅ Fichier config.json existe"
    echo ""
    echo "Registries authentifiés :"
    cat ~/.docker/config.json | grep -o '"[^"]*ghcr.io[^"]*"' 2>/dev/null || echo "❌ Pas d'authentification pour ghcr.io"
else
    echo "❌ Pas de fichier ~/.docker/config.json"
    echo "   → Pas d'authentification configurée"
fi
echo ""

# 2. Tester la connectivité à ghcr.io
echo "2️⃣ Connectivité à GitHub Container Registry"
echo "════════════════════════════════════════════"
if curl -s -o /dev/null -w "%{http_code}" https://ghcr.io/v2/ | grep -q "200\|401"; then
    echo "✅ ghcr.io est accessible"
else
    echo "❌ Impossible d'atteindre ghcr.io"
fi
echo ""

# 3. Tester l'accès aux images spécifiques
echo "3️⃣ Accès aux images VitaFlow"
echo "══════════════════════════════"
echo "Test backend image..."
if docker manifest inspect ghcr.io/abdelfattehsakkat/vitaflow/backend:latest >/dev/null 2>&1; then
    echo "✅ Backend image accessible"
else
    echo "❌ Backend image non accessible"
fi

echo "Test frontend image..."
if docker manifest inspect ghcr.io/abdelfattehsakkat/vitaflow/frontend:latest >/dev/null 2>&1; then
    echo "✅ Frontend image accessible"
else
    echo "❌ Frontend image non accessible"
fi
echo ""

# 4. Vérifier les images Docker locales
echo "4️⃣ Images Docker locales"
echo "═══════════════════════"
docker images | grep vitaflow || echo "Aucune image vitaflow locale"
echo ""

# 5. Résumé et solutions
echo "🔧 Solutions possibles"
echo "════════════════════"
echo ""
if [ ! -f ~/.docker/config.json ] || ! grep -q "ghcr.io" ~/.docker/config.json 2>/dev/null; then
    echo "Si les images sont PUBLIQUES :"
    echo "  → make deploy devrait fonctionner sans authentification"
    echo "  → Si ça échoue, vérifiez sur GitHub que les packages sont publics"
    echo ""
    echo "Si les images sont PRIVÉES :"
    echo "  → Créez un Personal Access Token sur GitHub"
    echo "  → Permissions : read:packages"
    echo "  → Connectez-vous : echo TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
fi
echo ""
echo "Vérifier les packages sur GitHub :"
echo "  https://github.com/abdelfattehsakkat?tab=packages"
