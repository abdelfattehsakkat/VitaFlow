#!/bin/bash
# Script de vérification pré-déploiement
# Vérifie que tout est configuré correctement avant de commiter et déployer

echo "🔍 Vérification de la configuration VitaFlow..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de vérification
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Vérifier les fichiers de configuration
echo "📁 Fichiers de configuration..."
[ -f .env.example ] && check ".env.example existe" || check ".env.example existe"
[ -f .env.prod.example ] && check ".env.prod.example existe" || check ".env.prod.example existe"
[ -f docker-compose.yml ] && check "docker-compose.yml existe" || check "docker-compose.yml existe"
[ -f docker-compose.prod.yml ] && check "docker-compose.prod.yml existe" || check "docker-compose.prod.yml existe"
[ -f Makefile ] && check "Makefile existe" || check "Makefile existe"
echo ""

# 2. Vérifier la pipeline GitHub Actions
echo "🔄 Pipeline CI/CD..."
[ -f .github/workflows/ci-cd.yml ] && check "ci-cd.yml existe" || check "ci-cd.yml existe"
echo ""

# 3. Vérifier les scripts
echo "📜 Scripts..."
[ -f scripts/seed-admin.sh ] && check "seed-admin.sh existe" || check "seed-admin.sh existe"
[ -x scripts/seed-admin.sh ] && check "seed-admin.sh est exécutable" || warn "seed-admin.sh n'est pas exécutable"
[ -f scripts/seed-admin-prod.sh ] && check "seed-admin-prod.sh existe" || check "seed-admin-prod.sh existe"
[ -x scripts/seed-admin-prod.sh ] && check "seed-admin-prod.sh est exécutable" || warn "seed-admin-prod.sh n'est pas exécutable"
echo ""

# 4. Vérifier la documentation
echo "📚 Documentation..."
[ -f README.md ] && check "README.md existe" || check "README.md existe"
[ -f DEPLOYMENT.md ] && check "DEPLOYMENT.md existe" || check "DEPLOYMENT.md existe"
[ -f DEPLOY_VPS.md ] && check "DEPLOY_VPS.md existe" || check "DEPLOY_VPS.md existe"
[ -f CI_CD.md ] && check "CI_CD.md existe" || check "CI_CD.md existe"
[ -f QUICK_REFERENCE.md ] && check "QUICK_REFERENCE.md existe" || check "QUICK_REFERENCE.md existe"
echo ""

# 5. Vérifier les Dockerfiles
echo "🐳 Dockerfiles..."
[ -f backend/Dockerfile ] && check "backend/Dockerfile existe" || check "backend/Dockerfile existe"
[ -f frontend/Dockerfile ] && check "frontend/Dockerfile existe" || check "frontend/Dockerfile existe"
echo ""

# 6. Vérifier les variables d'environnement critiques dans .env.prod.example
echo "🔐 Variables d'environnement production..."
if [ -f .env.prod.example ]; then
    grep -q "JWT_SECRET" .env.prod.example && check "JWT_SECRET configuré" || check "JWT_SECRET configuré"
    grep -q "JWT_REFRESH_SECRET" .env.prod.example && check "JWT_REFRESH_SECRET configuré" || check "JWT_REFRESH_SECRET configuré"
    grep -q "MONGO_ROOT_PASSWORD" .env.prod.example && check "MONGO_ROOT_PASSWORD configuré" || check "MONGO_ROOT_PASSWORD configuré"
    grep -q "GITHUB_REPOSITORY" .env.prod.example && check "GITHUB_REPOSITORY configuré" || check "GITHUB_REPOSITORY configuré"
fi
echo ""

# 7. Vérifier docker-compose.prod.yml
echo "⚙️  Configuration production..."
if [ -f docker-compose.prod.yml ]; then
    grep -q "JWT_REFRESH_SECRET" docker-compose.prod.yml && check "JWT_REFRESH_SECRET dans docker-compose.prod.yml" || check "JWT_REFRESH_SECRET dans docker-compose.prod.yml"
    grep -q "ghcr.io" docker-compose.prod.yml && check "Images GitHub Container Registry configurées" || check "Images GitHub Container Registry configurées"
fi
echo ""

# 8. Vérifier Git
echo "🌿 Git..."
if [ -d .git ]; then
    check "Repository Git initialisé"
    
    # Vérifier s'il y a un remote
    git remote -v > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
        if [ -n "$REMOTE" ]; then
            check "Remote Git configuré: $REMOTE"
        else
            warn "Aucun remote Git configuré"
        fi
    else
        warn "Aucun remote Git configuré"
    fi
    
    # Vérifier s'il y a des modifications non commitées
    if [ -n "$(git status --porcelain)" ]; then
        warn "Modifications non commitées détectées"
    else
        check "Pas de modifications non commitées"
    fi
else
    warn "Repository Git non initialisé"
fi
echo ""

# 9. Vérifier Docker
echo "🐋 Docker..."
if command -v docker &> /dev/null; then
    check "Docker installé"
    docker --version | head -n 1
    
    # Vérifier si Docker est en cours d'exécution
    docker ps &> /dev/null
    if [ $? -eq 0 ]; then
        check "Docker daemon en cours d'exécution"
    else
        warn "Docker daemon non accessible"
    fi
else
    warn "Docker non installé"
fi
echo ""

# 10. Vérifier Node.js
echo "📦 Node.js..."
if command -v node &> /dev/null; then
    check "Node.js installé"
    node --version
    
    if command -v npm &> /dev/null; then
        check "npm installé"
        npm --version
    fi
else
    warn "Node.js non installé"
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "📊 ${GREEN}Succès:${NC} $SUCCESS"
echo -e "📊 ${YELLOW}Avertissements:${NC} $WARNINGS"
echo -e "📊 ${RED}Erreurs:${NC} $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration prête pour le déploiement !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "  1. Commiter les modifications : git add . && git commit -m 'setup: configuration CI/CD'"
    echo "  2. Pousser sur GitHub : git push origin main"
    echo "  3. Vérifier le workflow : GitHub → Actions"
    echo "  4. Déployer sur VPS : Voir DEPLOY_VPS.md"
    exit 0
else
    echo -e "${RED}✗ Des erreurs doivent être corrigées avant le déploiement${NC}"
    exit 1
fi
