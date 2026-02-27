# 🚀 Guide de Déploiement VitaFlow

Ce guide explique comment déployer VitaFlow en production avec Docker et GitHub Actions.

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Configuration GitHub Actions](#configuration-github-actions)
- [Déploiement Local](#déploiement-local)
- [Déploiement Production](#déploiement-production)
- [Maintenance](#maintenance)
- [Sécurité](#sécurité)

## 🏗️ Architecture

VitaFlow utilise une architecture en 3 tiers :

- **Frontend** : React + Vite + Nginx (Port 80)
- **Backend** : Node.js + Express (Port 3001)
- **Database** : MongoDB (Port 27017)

Toutes les applications sont conteneurisées avec Docker et orchestrées avec Docker Compose.

## 📦 Prérequis

### Développement Local
- Docker & Docker Compose
- Node.js 20+
- Git

### Production
- Serveur Linux (Ubuntu 22.04+ recommandé)
- Docker & Docker Compose installés
- Nom de domaine (optionnel)
- Certificat SSL (Let's Encrypt recommandé)

## 🔧 Configuration GitHub Actions

### 1. Activer GitHub Container Registry

Les images Docker sont publiées automatiquement sur GitHub Container Registry (ghcr.io).

### 2. Configurer les Secrets (optionnel)

Si vous utilisez un registre privé ou d'autres services :

1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez les secrets nécessaires

### 3. Workflow CI/CD

Le workflow `.github/workflows/ci-cd.yml` s'exécute automatiquement :

- **Sur Push** vers `main` ou `develop` : Tests + Build + Push images
- **Sur Tag** `v*` : Crée une release avec images versionnées
- **Sur Pull Request** : Tests uniquement

#### Utilisation des images

Les images sont disponibles sur :
```
ghcr.io/VOTRE-USERNAME/vitaflow/backend:latest
ghcr.io/VOTRE-USERNAME/vitaflow/frontend:latest
```

Pour une version spécifique :
```
ghcr.io/VOTRE-USERNAME/vitaflow/backend:v1.0.0
ghcr.io/VOTRE-USERNAME/vitaflow/frontend:v1.0.0
```

## 🏠 Déploiement Local

### Développement avec Build Local

```bash
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/VitaFlow.git
cd VitaFlow

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# Lancer avec Docker Compose (build local)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Accès aux services

- Frontend : http://localhost
- Backend API : http://localhost:3001
- MongoDB : localhost:27017

## 🌐 Déploiement Production

### 1. Préparer le serveur

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt update
sudo apt install docker-compose-plugin

# Créer un utilisateur pour l'application (optionnel mais recommandé)
sudo useradd -m -s /bin/bash vitaflow
sudo usermod -aG docker vitaflow
```

### 2. Déployer l'application

```bash
# Se connecter en tant qu'utilisateur vitaflow
sudo su - vitaflow

# Cloner uniquement les fichiers de config
mkdir vitaflow-prod && cd vitaflow-prod
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/.env.prod.example

# Configurer les variables d'environnement
cp .env.prod.example .env
nano .env  # Éditez avec vos valeurs de production

# ⚠️ IMPORTANT : Changez les mots de passe et secrets !
```

### 3. Configurer les variables d'environnement

Éditez `.env` et changez **OBLIGATOIREMENT** :

```bash
# GitHub (remplacez par votre username)
GITHUB_REPOSITORY=VOTRE-USERNAME/vitaflow
VERSION=main  # ou une version spécifique comme v1.0.0

# MongoDB - CHANGEZ CES VALEURS !
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseTresFort123!@#
MONGO_DB=cabinet
MONGO_PORT=27017

# Backend - GÉNÉREZ UN SECRET JWT FORT !
BACKEND_PORT=3001
JWT_SECRET=$(openssl rand -base64 48)  # Générez une clé aléatoire
JWT_REFRESH_SECRET=$(openssl rand -base64 48)  # Générez une autre clé différente
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_PORT=80
```

### 4. Lancer l'application

```bash
# Télécharger les images depuis GitHub Container Registry
docker-compose -f docker-compose.prod.yml pull

# Lancer l'application
docker-compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Configuration Nginx avec SSL (optionnel)

Pour exposer l'application avec un nom de domaine et HTTPS :

```bash
# Installer Nginx et Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/vitaflow
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/vitaflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Auto-renouvellement du certificat
sudo certbot renew --dry-run
```

## 🔄 Maintenance

### Mise à jour de l'application

```bash
cd vitaflow-prod

# Télécharger les nouvelles images
docker-compose -f docker-compose.prod.yml pull

# Recréer les conteneurs avec les nouvelles images
docker-compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps
```

### Sauvegardes MongoDB

#### Sauvegarde manuelle

```bash
# Créer le dossier de backup
mkdir -p ./backups

# Sauvegarder la base de données
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump \
  --username admin \
  --password VOTRE_MOT_DE_PASSE \
  --authenticationDatabase admin \
  --db cabinet \
  --archive=/backups/backup-$(date +%Y%m%d-%H%M%S).gz \
  --gzip
```

#### Restauration depuis une sauvegarde

```bash
# Restaurer une sauvegarde
docker-compose -f docker-compose.prod.yml exec -T mongodb mongorestore \
  --username admin \
  --password VOTRE_MOT_DE_PASSE \
  --authenticationDatabase admin \
  --archive=/backups/backup-20240227-120000.gz \
  --gzip
```

#### Sauvegarde automatique (cron)

```bash
# Éditer crontab
crontab -e

# Ajouter une sauvegarde quotidienne à 2h du matin
0 2 * * * cd /home/vitaflow/vitaflow-prod && docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --username admin --password VOTRE_MOT_DE_PASSE --authenticationDatabase admin --db cabinet --archive=/backups/backup-$(date +\%Y\%m\%d).gz --gzip

# Nettoyer les anciennes sauvegardes (garder 30 jours)
0 3 * * * find /home/vitaflow/vitaflow-prod/backups -name "backup-*.gz" -mtime +30 -delete
```

### Logs

```bash
# Voir tous les logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mongodb

# Dernières 100 lignes
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Monitoring

```bash
# Voir l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir l'utilisation des ressources
docker stats

# Health check
curl http://localhost:3001/api/health
```

## 🔒 Sécurité

### Checklist de sécurité

- [ ] Changer les mots de passe par défaut (MongoDB, JWT)
- [ ] Utiliser un JWT_SECRET fort (48+ caractères aléatoires)
- [ ] Utiliser un JWT_REFRESH_SECRET différent de JWT_SECRET
- [ ] Activer HTTPS avec certificat SSL
- [ ] Configurer un firewall (ufw)
- [ ] Limiter l'accès SSH (clés uniquement)
- [ ] Mettre à jour régulièrement les images Docker
- [ ] Sauvegarder la base de données régulièrement
- [ ] Monitorer les logs pour détecter les anomalies
- [ ] Utiliser des volumes Docker pour les données sensibles
- [ ] Ne pas exposer MongoDB sur Internet (port 27017)

### Configuration du firewall

```bash
# Installer ufw
sudo apt install ufw

# Autoriser SSH, HTTP et HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### Générer des JWT Secrets forts

```bash
# Méthode 1 : OpenSSL (générez deux clés différentes)
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"

# Méthode 2 : Node.js
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(48).toString('base64'))"
```

**Important :** Utilisez deux secrets différents pour JWT_SECRET et JWT_REFRESH_SECRET.

## 🆘 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs

# Vérifier l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps -a

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend
```

### Erreur de connexion MongoDB

Vérifiez que :
- Le conteneur MongoDB est bien démarré
- Les identifiants dans `.env` sont corrects
- Le backend attend que MongoDB soit prêt (healthcheck)

### Images non trouvées

```bash
# Vérifier que les images sont publiques sur GitHub
# Ou se connecter au registre si privé
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Problème de permissions

```bash
# Donner les permissions à l'utilisateur vitaflow
sudo chown -R vitaflow:vitaflow /home/vitaflow/vitaflow-prod
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## 📄 Fichiers de configuration

- `Dockerfile` (backend) : Image Docker du backend
- `Dockerfile` (frontend) : Image Docker du frontend
- `docker-compose.yml` : Orchestration pour développement local
- `docker-compose.prod.yml` : Orchestration pour production
- `.env.example` : Variables d'environnement (développement)
- `.env.prod.example` : Variables d'environnement (production)
- `.github/workflows/ci-cd.yml` : Pipeline CI/CD

## 🎯 Prochaines étapes

- [ ] Configurer les sauvegardes automatiques
- [ ] Mettre en place un système de monitoring (Prometheus + Grafana)
- [ ] Configurer les alertes (email, Slack)
- [ ] Ajouter des tests d'intégration
- [ ] Documenter l'API avec Swagger
- [ ] Mettre en place un environnement de staging
