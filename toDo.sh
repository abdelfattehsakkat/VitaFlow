# Se connecter au VPS
ssh root@votre-vps-ip

# Créer le dossier
mkdir -p ~/vitaflow-prod && cd ~/vitaflow-prod

# Télécharger les fichiers
wget https://raw.githubusercontent.com/abdelfattehsakkat/VitaFlow/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/abdelfattehsakkat/VitaFlow/main/.env.prod.example
wget https://raw.githubusercontent.com/abdelfattehsakkat/VitaFlow/main/Makefile

# Configuration
cp .env.prod.example .env
nano .env  # Éditer :
# - GITHUB_REPOSITORY=abdelfattehsakkat/VitaFlow
# - MONGO_ROOT_PASSWORD=...
# - JWT_SECRET=$(openssl rand -base64 48)
# - JWT_REFRESH_SECRET=$(openssl rand -base64 48)

# Déployer
make deploy

# Créer l'admin
make deploy-seed