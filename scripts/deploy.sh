#!/bin/bash

# Script utilitaire pour VitaFlow
# Usage: ./scripts/deploy.sh [command]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    log_info "Docker et Docker Compose sont installés ✓"
}

# Build local
build_local() {
    log_info "Build des images Docker en local..."
    docker-compose build
    log_info "Build terminé ✓"
}

# Démarrer en mode développement
start_dev() {
    log_info "Démarrage de l'application en mode développement..."
    if [ ! -f .env ]; then
        log_warn "Fichier .env non trouvé, copie depuis .env.example"
        cp .env.example .env
        log_warn "⚠️  Pensez à éditer le fichier .env avec vos valeurs"
    fi
    docker-compose up -d
    log_info "Application démarrée ✓"
    log_info "Frontend: http://localhost"
    log_info "Backend: http://localhost:3001"
    log_info "MongoDB: localhost:27017"
}

# Arrêter l'application
stop() {
    log_info "Arrêt de l'application..."
    docker-compose down
    log_info "Application arrêtée ✓"
}

# Voir les logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Backup de la base de données
backup() {
    log_info "Sauvegarde de la base de données..."
    mkdir -p ./backups
    
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_FILE="./backups/backup-${TIMESTAMP}.gz"
    
    docker-compose exec -T mongodb mongodump \
        --username admin \
        --password vitaflow2024 \
        --authenticationDatabase admin \
        --db cabinet \
        --archive="${BACKUP_FILE}" \
        --gzip
    
    log_info "Sauvegarde créée: ${BACKUP_FILE} ✓"
}

# Restore de la base de données
restore() {
    if [ -z "$1" ]; then
        log_error "Usage: ./scripts/deploy.sh restore <backup-file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        log_error "Fichier de sauvegarde non trouvé: $1"
        exit 1
    fi
    
    log_warn "⚠️  Ceci va écraser la base de données actuelle !"
    read -p "Êtes-vous sûr ? (yes/no) " -n 3 -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log_info "Restauration annulée"
        exit 0
    fi
    
    log_info "Restauration de la base de données..."
    docker-compose exec -T mongodb mongorestore \
        --username admin \
        --password vitaflow2024 \
        --authenticationDatabase admin \
        --drop \
        --archive="$1" \
        --gzip
    
    log_info "Base de données restaurée ✓"
}

# Déploiement production
deploy_prod() {
    log_info "Déploiement en production..."
    
    if [ ! -f .env ]; then
        log_error "Fichier .env non trouvé. Copiez .env.prod.example et configurez-le."
        exit 1
    fi
    
    # Pull des images depuis le registre
    log_info "Téléchargement des images..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Démarrage
    log_info "Démarrage des conteneurs..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log_info "Déploiement terminé ✓"
}

# Status des conteneurs
status() {
    log_info "État des conteneurs:"
    docker-compose ps
    echo
    log_info "Utilisation des ressources:"
    docker stats --no-stream
}

# Nettoyage
clean() {
    log_warn "⚠️  Ceci va supprimer tous les conteneurs, images et volumes !"
    read -p "Êtes-vous sûr ? (yes/no) " -n 3 -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log_info "Nettoyage annulé"
        exit 0
    fi
    
    log_info "Nettoyage en cours..."
    docker-compose down -v --rmi all
    log_info "Nettoyage terminé ✓"
}

# Afficher l'aide
show_help() {
    cat << EOF
VitaFlow - Script de déploiement

Usage: ./scripts/deploy.sh [command]

Commandes disponibles:
  build         Build des images Docker en local
  start         Démarrer l'application (développement)
  stop          Arrêter l'application
  restart       Redémarrer l'application
  logs [service] Voir les logs (optionnel: backend|frontend|mongodb)
  status        Voir l'état des conteneurs
  backup        Sauvegarder la base de données
  restore <file> Restaurer la base de données depuis un fichier
  deploy        Déployer en production (utilise docker-compose.prod.yml)
  clean         Nettoyer tous les conteneurs et volumes (⚠️  destructif)
  help          Afficher cette aide

Examples:
  ./scripts/deploy.sh start
  ./scripts/deploy.sh logs backend
  ./scripts/deploy.sh backup
  ./scripts/deploy.sh restore ./backups/backup-20240227-120000.gz

EOF
}

# Main
check_docker

case "${1:-help}" in
    build)
        build_local
        ;;
    start)
        start_dev
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start_dev
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    deploy)
        deploy_prod
        ;;
    clean)
        clean
        ;;
    help|*)
        show_help
        ;;
esac
