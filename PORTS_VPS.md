# 🔌 Configuration des Ports - VPS

Documentation des ports utilisés sur le VPS pour éviter les conflits entre applications.

## 📊 Ports Utilisés

### Applications Existantes (Cabinet)

```
┌─────────────────────┬───────────┬──────────────────────┐
│ Service             │ Port      │ Conteneur            │
├─────────────────────┼───────────┼──────────────────────┤
│ Vitrine Dentaire    │ 3002      │ dental-clinic-app    │
│ Cabinet Frontend    │ 8080      │ cabinet-front2       │
│ Cabinet Backend     │ 3000      │ cabinet-backend      │
│ MongoDB Cabinet     │ 27017     │ cabinet-mongodb      │
└─────────────────────┴───────────┴──────────────────────┘
```

### VitaFlow (Nouvelle Application)

```
┌─────────────────────┬───────────┬────────────────────────┐
│ Service             │ Port      │ Conteneur              │
├─────────────────────┼───────────┼────────────────────────┤
│ Frontend            │ 80        │ vitaflow-frontend-prod │
│ Backend API         │ 3001      │ vitaflow-backend-prod  │
│ MongoDB VitaFlow    │ 27018     │ vitaflow-mongodb-prod  │
└─────────────────────┴───────────┴────────────────────────┘
```

## 🔐 Configuration .env sur le VPS

Créez le fichier `.env` avec ces ports :

```bash
# VitaFlow - Configuration VPS
GITHUB_REPOSITORY=abdelfattehsakkat/vitaflow
VERSION=latest

# MongoDB - Port 27018 (27017 utilisé par cabinet-mongodb)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MONGO_DB=cabinet
MONGO_PORT=27018

# Backend - Port 3001 (3000 utilisé par cabinet-backend)
BACKEND_PORT=3001
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
JWT_EXPIRES_IN=7d

# Frontend - Port 80
FRONTEND_PORT=80
```

## 🌐 Accès aux Applications

### Via Ports Directs

```bash
# Cabinet (existant)
curl http://votre-vps-ip:3002    # Vitrine dentaire
curl http://votre-vps-ip:8080    # Cabinet frontend
curl http://votre-vps-ip:3000    # Cabinet backend

# VitaFlow (nouveau)
curl http://votre-vps-ip         # Frontend (port 80)
curl http://votre-vps-ip:3001    # Backend API
```

### Via Nginx (Recommandé)

Configurez Nginx pour utiliser des domaines :

```nginx
# /etc/nginx/sites-available/cabinet
server {
    listen 80;
    server_name cabinet.votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:8080;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}

# /etc/nginx/sites-available/vitaflow
server {
    listen 80;
    server_name vitaflow.votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:80;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## 📝 MongoDB - Connexions

### Cabinet MongoDB (existant)

```bash
# Port externe: 27017
mongosh "mongodb://admin:password@votre-vps-ip:27017/cabinet?authSource=admin"

# OU via Robo 3T / MongoDB Compass
Host: votre-vps-ip
Port: 27017
Database: cabinet
Auth Database: admin
```

### VitaFlow MongoDB (nouveau)

```bash
# Port externe: 27018
mongosh "mongodb://admin:password@votre-vps-ip:27018/cabinet?authSource=admin"

# OU via Robo 3T / MongoDB Compass
Host: votre-vps-ip
Port: 27018
Database: cabinet
Auth Database: admin
```

**Important :** Les deux applications utilisent le même nom de base `cabinet` mais sur des instances MongoDB **séparées**.

## 🔍 Vérifier les Ports Disponibles

Avant de déployer une nouvelle application, vérifiez les ports utilisés :

```bash
# Voir tous les ports écoutés
sudo ss -tulpn | grep LISTEN

# Vérifier un port spécifique
sudo lsof -i :80
sudo lsof -i :3001
sudo lsof -i :27018

# Via Docker
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

## 🔒 Firewall (UFW)

Assurez-vous que les ports nécessaires sont ouverts :

```bash
# Ports essentiels
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Ports spécifiques (si accès direct nécessaire)
sudo ufw allow 3001/tcp    # VitaFlow Backend
sudo ufw allow 3002/tcp    # Vitrine Dentaire

# NE PAS exposer MongoDB publiquement
# sudo ufw deny 27017/tcp
# sudo ufw deny 27018/tcp

# Activer le firewall
sudo ufw enable
sudo ufw status
```

## 🚀 Déploiement VitaFlow

```bash
# Sur le VPS
cd ~/vitaflow-prod

# Vérifier la configuration
cat .env | grep PORT

# Déployer
make deploy

# Vérifier que les ports sont bien utilisés
docker ps | grep vitaflow

# Tester
curl http://localhost:3001/api/health
```

## 🔄 Changement de Ports

Si vous devez changer les ports après déploiement :

```bash
# 1. Arrêter VitaFlow
cd ~/vitaflow-prod
docker-compose -f docker-compose.prod.yml down

# 2. Modifier .env
nano .env
# Changer BACKEND_PORT, FRONTEND_PORT ou MONGO_PORT

# 3. Redémarrer
docker-compose -f docker-compose.prod.yml up -d

# 4. Vérifier
docker ps
curl http://localhost:NOUVEAU_PORT/api/health
```

## 📊 Résumé des Ports

| Port  | Service                    | Application |
|-------|----------------------------|-------------|
| 22    | SSH                        | Système     |
| 80    | HTTP / VitaFlow Frontend   | VitaFlow    |
| 443   | HTTPS                      | Nginx/SSL   |
| 3000  | Cabinet Backend            | Cabinet     |
| 3001  | VitaFlow Backend           | VitaFlow    |
| 3002  | Vitrine Dentaire           | Cabinet     |
| 8080  | Cabinet Frontend           | Cabinet     |
| 27017 | MongoDB Cabinet            | Cabinet     |
| 27018 | MongoDB VitaFlow           | VitaFlow    |

## ⚠️ Points d'Attention

1. **MongoDB** : Deux instances séparées pour éviter les conflits de données
2. **Backup** : Configurez des backups séparés pour chaque instance MongoDB
3. **Firewall** : Ne jamais exposer MongoDB directement sur Internet
4. **Nginx** : Utilisez des sous-domaines pour un accès propre (recommandé)
5. **SSL** : Configurez Let's Encrypt pour chaque domaine

## 🆘 Dépannage

### Port déjà utilisé

```bash
# Identifier qui utilise le port
sudo lsof -i :PORT_NUMBER

# Arrêter le conteneur conflictuel
docker stop NOM_CONTENEUR
```

### Conflit de nom de conteneur

```bash
# Voir tous les conteneurs (même arrêtés)
docker ps -a

# Supprimer un conteneur arrêté
docker rm NOM_CONTENEUR
```

### MongoDB - Connexion refusée

```bash
# Vérifier que MongoDB est démarré
docker ps | grep mongodb

# Voir les logs
docker logs vitaflow-mongodb-prod

# Tester la connexion
docker exec vitaflow-mongodb-prod mongosh --eval "db.adminCommand('ping')"
```

---

📚 **Documentation complète** : [DEPLOY_VPS.md](./DEPLOY_VPS.md)
