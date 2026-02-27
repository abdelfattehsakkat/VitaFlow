# 🚀 Guide Rapide de Déploiement VPS

Guide concis pour déployer VitaFlow sur votre VPS en production.

## 📋 Prérequis

- VPS Linux (Ubuntu 22.04+ recommandé)
- Accès SSH root ou sudo
- Nom de domaine pointant vers votre VPS (optionnel)

## ⚡ Déploiement en 5 étapes

### 1️⃣ Installer Docker sur le VPS

```bash
# Se connecter au VPS
ssh root@votre-vps-ip

# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt update && sudo apt install -y docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version
```

### 2️⃣ Préparer l'application

```bash
# Créer le dossier de l'application
mkdir -p ~/vitaflow-prod && cd ~/vitaflow-prod

# Télécharger les fichiers de configuration
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/.env.prod.example
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/Makefile

# Créer le fichier .env
cp .env.prod.example .env
```

### 3️⃣ Configurer les variables d'environnement

Éditez le fichier `.env` :

```bash
nano .env
```

**IMPORTANT :** Modifiez ces valeurs :

```bash
# Remplacez par votre username GitHub
GITHUB_REPOSITORY=VOTRE-USERNAME/VitaFlow
VERSION=latest

# MongoDB - Changez le mot de passe !
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseTresSecurise123!
MONGO_DB=cabinet

# JWT - Générez des secrets forts !
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
JWT_EXPIRES_IN=7d

# Ports
BACKEND_PORT=3001
FRONTEND_PORT=80
```

**Générer les secrets JWT :**

```bash
# Générez deux secrets différents
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"
```

### 4️⃣ Déployer l'application

```bash
# Télécharger les images Docker depuis GitHub Container Registry
docker compose -f docker-compose.prod.yml pull

# OU avec le Makefile
make deploy

# Lancer l'application
docker compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
docker compose -f docker-compose.prod.yml ps
```

Vous devriez voir 3 conteneurs **healthy** :
- `vitaflow-mongodb-prod`
- `vitaflow-backend-prod`
- `vitaflow-frontend-prod`

### 5️⃣ Créer le compte admin

```bash
# Créer le script seed sur le VPS
cat > seed-admin.sh << 'EOF'
#!/bin/bash
docker exec vitaflow-backend-prod node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(async () => {
  const User = require('/app/dist/models/User.js').default;
  const Counter = require('/app/dist/models/Counter.js').default;
  
  const counter = await Counter.findOneAndUpdate(
    { _id: 'patientId' },
    { $setOnInsert: { seq: 0 } },
    { upsert: true, new: true }
  );
  
  const existingAdmin = await User.findOne({ email: 'admin@vitaflow.com' });
  if (existingAdmin) {
    console.log('Admin existe déjà');
    process.exit(0);
  }
  
  await User.create({
    email: 'admin@vitaflow.com',
    password: 'adminadmin',
    nom: 'Admin',
    prenom: 'VitaFlow',
    role: 'admin',
    telephone: '0600000000',
    isActive: true
  });
  
  console.log('✅ Admin créé: admin@vitaflow.com / adminadmin');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
"
EOF

# Rendre exécutable et lancer
chmod +x seed-admin.sh
./seed-admin.sh
```

## ✅ Vérifier le déploiement

### Tester l'API

```bash
# Test de santé
curl http://localhost:3001/api/health

# Test de connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vitaflow.com","password":"adminadmin"}'
```

Si vous voyez `"success":true` avec un `accessToken`, c'est bon ! 🎉

### Accéder à l'application

- **Frontend** : http://votre-vps-ip
- **API** : http://votre-vps-ip:3001/api/health

**Identifiants par défaut :**
- Email : `admin@vitaflow.com`
- Mot de passe : `adminadmin`

⚠️ **Changez ce mot de passe après la première connexion !**

## 🔒 Configuration HTTPS (Recommandé)

### Avec Nginx et Let's Encrypt

```bash
# Installer Nginx et Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/vitaflow
```

Collez cette configuration :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activer et tester
sudo ln -s /etc/nginx/sites-available/vitaflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir un certificat SSL gratuit
sudo certbot --nginx -d votre-domaine.com

# Certbot configurera automatiquement HTTPS
```

## 🔄 Commandes utiles avec Makefile

```bash
# Démarrer
make deploy

# Voir les logs
make deploy-logs

# Voir l'état
make deploy-status

# Arrêter
make deploy-stop

# Mettre à jour (après push sur GitHub)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 🆘 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs

# Vérifier Docker
sudo systemctl status docker

# Libérer de l'espace
docker system prune -a
```

### Erreur "Image not found"

Vérifiez que votre repository GitHub est public ou authentifiez-vous :

```bash
# Se connecter au GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u VOTRE-USERNAME --password-stdin
```

### Port déjà utilisé

```bash
# Vérifier les ports utilisés
sudo lsof -i :80
sudo lsof -i :3001

# Modifier les ports dans .env si nécessaire
nano .env
```

## 📚 Documentation complète

Pour plus de détails, consultez [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🎯 Next Steps

1. ✅ Changez le mot de passe admin après la première connexion
2. ✅ Configurez HTTPS avec Let's Encrypt
3. ✅ Configurez le firewall : `sudo ufw allow 80,443/tcp && sudo ufw enable`
4. ✅ Configurez les sauvegardes automatiques (voir DEPLOYMENT.md)
5. ✅ Monitorez les logs : `make deploy-logs`

---

🎉 **Félicitations ! VitaFlow est maintenant en production !**
