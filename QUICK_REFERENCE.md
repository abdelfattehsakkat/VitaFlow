# ⚡ Référence Rapide - VitaFlow

Commandes essentielles pour développer et déployer VitaFlow.

## 📋 Table des matières

- [Développement Local](#développement-local)
- [Docker (Dev)](#docker-dev)
- [Production/VPS](#productionvps)
- [Git & CI/CD](#git--cicd)
- [Maintenance](#maintenance)

---

## 🖥️ Développement Local

### Setup Initial
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run seed            # Créer l'admin
npm run dev             # Démarrer (port 3001)

# Frontend
cd frontend
npm install
npm run dev             # Démarrer (port 5173)
```

### Tests & Lint
```bash
# Backend
cd backend
npm test
npm run lint
npm run build

# Frontend
cd frontend
npm test
npm run lint
npm run build
```

### MongoDB Local (sans Docker)
```bash
# Installer MongoDB
brew install mongodb-community@7           # macOS
sudo apt install mongodb-server            # Linux

# Démarrer
brew services start mongodb-community      # macOS
sudo systemctl start mongod                # Linux

# Se connecter
mongosh
```

---

## 🐳 Docker (Dev)

### Quick Start
```bash
make help               # Liste toutes les commandes
make start              # Démarrer tous les services
make seed               # Créer l'admin (admin@vitaflow.com / adminadmin)
make logs               # Voir les logs
make stop               # Arrêter
make restart            # Redémarrer
```

### Commandes Détaillées
```bash
# Build
make build              # Build les images Docker
docker-compose build    # Équivalent

# Gestion
make status             # État des conteneurs + ressources
docker-compose ps       # Liste des conteneurs

# Logs
make logs               # Tous les logs
make logs-backend       # Backend uniquement
make logs-frontend      # Frontend uniquement
make logs-mongodb       # MongoDB uniquement

# Health check
make health             # Tester backend + frontend
curl http://localhost:3001/api/health  # Backend
curl http://localhost                  # Frontend

# Clean
make clean              # Supprimer TOUT (conteneurs, volumes, images)
                        # ⚠️ Supprime les données !
```

### Services & Ports
```
Frontend:   http://localhost:80
Backend:    http://localhost:3001
MongoDB:    localhost:27017
```

### Volumes Docker
```bash
# Voir les volumes
docker volume ls | grep vitaflow

# Volumes persistants :
vitaflow_mongodb_data    # Données MongoDB
vitaflow_mongodb_config  # Config MongoDB
```

---

## 🌐 Production/VPS

### Configuration Initiale (une fois)
```bash
# Sur le VPS
ssh root@votre-vps-ip

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin

# Créer le dossier
mkdir -p ~/vitaflow-prod && cd ~/vitaflow-prod

# Télécharger les fichiers
wget https://raw.githubusercontent.com/VOTRE-USER/VitaFlow/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/VOTRE-USER/VitaFlow/main/.env.prod.example
wget https://raw.githubusercontent.com/VOTRE-USER/VitaFlow/main/Makefile

# Configurer
cp .env.prod.example .env
nano .env  # Éditer les secrets !
```

### Variables d'environnement (.env)
```bash
# À modifier OBLIGATOIREMENT :
GITHUB_REPOSITORY=votre-username/vitaflow
MONGO_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MONGO_PORT=27018  # 27017 si pas d'autre MongoDB, 27018 si conflit
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
```

**⚠️ Ports VPS** : Si vous avez d'autres applications, voir [PORTS_VPS.md](./PORTS_VPS.md) pour éviter les conflits.

### Déploiement
```bash
# Premier déploiement
make deploy             # Pull images + Start
make deploy-seed        # Créer l'admin

# Vérifier
make deploy-status      # État des conteneurs
make deploy-logs        # Voir les logs

# Tester
curl http://localhost:3001/api/health
```

### Mise à jour
```bash
# Après push sur GitHub (new images)
cd ~/vitaflow-prod
make deploy             # Pull nouvelles images + restart
```

### Gestion
```bash
make deploy-status      # Voir l'état
make deploy-logs        # Logs en temps réel
make deploy-stop        # Arrêter
```

### Rollback vers version spécifique
```bash
# Dans .env, changer :
VERSION=v1.0.0          # Au lieu de "latest"

# Puis :
make deploy
```

---

## 🔄 Git & CI/CD

### Workflow Standard
```bash
# 1. Feature branch
git checkout -b feature/ma-feature
# ... développement ...
git add .
git commit -m "feat: description"
git push origin feature/ma-feature

# 2. Pull Request → develop
# Créer PR sur GitHub : feature → develop
# → GitHub Actions exécute les tests

# 3. Merge dans main
git checkout main
git pull origin main
git merge develop
git push origin main
# → GitHub Actions : Tests + Build + Push images

# 4. Tag de version
git tag v1.0.0
git push origin v1.0.0
# → GitHub Actions : Build images avec versions
```

### Commits Conventionnels
```bash
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage, pas de changement de code
refactor: Refactoring
test:     Ajout de tests
chore:    Maintenance (dépendances, config)
```

### Voir le statut CI/CD
```
GitHub → Actions → CI/CD Pipeline
```

### Images Docker produites
```
# Latest (main)
ghcr.io/username/vitaflow/backend:latest
ghcr.io/username/vitaflow/frontend:latest

# Version (tag v1.0.0)
ghcr.io/username/vitaflow/backend:v1.0.0
ghcr.io/username/vitaflow/backend:1.0
```

---

## 🛠️ Maintenance

### Backup MongoDB
```bash
# Dev
make backup
# Crée: ./backups/backup-YYYYMMDD-HHMMSS.gz

# Prod (sur VPS)
cd ~/vitaflow-prod
docker-compose -f docker-compose.prod.yml exec -T mongodb \
  mongodump --username admin --password VOTRE_PASSWORD \
  --authenticationDatabase admin --db cabinet \
  --archive=/backups/backup-$(date +%Y%m%d).gz --gzip
```

### Restore MongoDB
```bash
# Dev
docker-compose exec -T mongodb mongorestore \
  --username admin --password vitaflow2024 \
  --authenticationDatabase admin \
  --archive=/backups/backup-20240227.gz --gzip

# Prod (sur VPS)
cd ~/vitaflow-prod
docker-compose -f docker-compose.prod.yml exec -T mongodb \
  mongorestore --username admin --password VOTRE_PASSWORD \
  --authenticationDatabase admin \
  --archive=/backups/backup-20240227.gz --gzip
```

### Backup Automatique (Cron)
```bash
# Sur le VPS
crontab -e

# Backup quotidien à 2h
0 2 * * * cd /home/vitaflow/vitaflow-prod && docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump ... --archive=/backups/backup-$(date +\%Y\%m\%d).gz --gzip

# Nettoyer backups > 30 jours
0 3 * * * find /home/vitaflow/vitaflow-prod/backups -name "backup-*.gz" -mtime +30 -delete
```

### Logs
```bash
# Dev
make logs                        # Tous les logs
make logs-backend                # Backend
docker-compose logs --tail=100   # 100 dernières lignes

# Prod
make deploy-logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Monitoring
```bash
# Voir ressources utilisées
docker stats

# Dev
make status

# Prod
make deploy-status
```

### Nettoyer Docker
```bash
# Supprimer conteneurs arrêtés
docker container prune

# Supprimer images non utilisées
docker image prune

# Supprimer TOUT (⚠️ données perdues)
docker system prune -a --volumes
```

---

## 🔐 Sécurité

### Générer Secrets JWT
```bash
# Méthode 1 : OpenSSL
openssl rand -base64 48

# Méthode 2 : Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Générer les deux (JWT_SECRET et JWT_REFRESH_SECRET)
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"
```

### Firewall VPS
```bash
sudo apt install ufw
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

### HTTPS (Let's Encrypt)
```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
sudo certbot renew --dry-run  # Test auto-renouvellement
```

---

## 🧪 Tests Rapides

### Backend
```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vitaflow.com","password":"adminadmin"}'
```

### Frontend
```bash
# Accessible ?
curl -I http://localhost
```

### MongoDB
```bash
# Connexion directe
mongosh mongodb://admin:vitaflow2024@localhost:27017/cabinet?authSource=admin

# Dans mongosh :
show databases
use cabinet
show collections
db.users.find()
```

---

## 📚 Documentation Complète

- **[README.md](./README.md)** - Vue d'ensemble
- **[DEPLOY_VPS.md](./DEPLOY_VPS.md)** - Guide rapide VPS (5 étapes)
- **[CI_CD.md](./CI_CD.md)** - Pipeline GitHub Actions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide exhaustif production
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Plan de développement
- **[PROGRESS.md](./PROGRESS.md)** - Suivi de l'avancement

---

## ⚡ Commandes les plus utilisées

```bash
# Dev
make start && make seed         # Démarrer + créer admin
make logs                       # Voir les logs
make restart                    # Redémarrer

# Prod
make deploy && make deploy-seed # Déployer + créer admin
make deploy-logs                # Voir les logs
make deploy                     # Mettre à jour

# Git
git add . && git commit -m "feat: xxx" && git push
git tag v1.0.0 && git push origin v1.0.0
```

---

✨ **Pro Tip** : Ajoutez ce fichier à vos favoris pour un accès rapide !
