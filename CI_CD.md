# 🔄 Guide CI/CD - VitaFlow

Documentation du pipeline CI/CD avec GitHub Actions et déploiement Docker.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Workflow GitHub Actions](#workflow-github-actions)
- [Utilisation](#utilisation)
- [Déploiement VPS](#déploiement-vps)
- [Commandes Makefile](#commandes-makefile)

## 🎯 Vue d'ensemble

Le pipeline CI/CD automatise :
- ✅ Tests du backend et frontend
- ✅ Build des images Docker
- ✅ Push vers GitHub Container Registry (ghcr.io)
- ✅ Déploiement sur VPS avec docker-compose

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│    GitHub    │─────▶│     VPS     │
│ Repository  │      │   Actions    │      │   Docker    │
│   (Code)    │      │   (CI/CD)    │      │  Compose    │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │    GitHub    │
                     │  Container   │
                     │   Registry   │
                     └──────────────┘
```

## 🚀 Workflow GitHub Actions

Fichier : `.github/workflows/ci-cd.yml`

### Déclencheurs

Le workflow s'exécute automatiquement sur :

1. **Push sur `main` ou `develop`** :
   - Tests backend + frontend
   - Build images Docker
   - Push vers ghcr.io avec tag `main` ou `develop`

2. **Tag `v*` (ex: v1.0.0)** :
   - Tests backend + frontend
   - Build images Docker
   - Push vers ghcr.io avec tags versionnés

3. **Pull Request vers `main` ou `develop`** :
   - Tests uniquement (pas de build)

### Jobs

#### 1. test-backend
- Checkout du code
- Setup Node.js 20
- Installation des dépendances
- Lint (si configuré)
- Tests

#### 2. test-frontend
- Checkout du code
- Setup Node.js 20
- Installation des dépendances
- Lint
- Build du frontend

#### 3. build-backend
- Dépend de : `test-backend`
- Setup Docker Buildx
- Login sur ghcr.io
- Build image multi-architecture (linux/amd64, linux/arm64)
- Push sur ghcr.io

#### 4. build-frontend
- Dépend de : `test-frontend`
- Setup Docker Buildx
- Login sur ghcr.io
- Build image multi-architecture (linux/amd64, linux/arm64)
- Push sur ghcr.io

### Registre d'images

Les images sont publiées sur GitHub Container Registry :

```
ghcr.io/VOTRE-USERNAME/vitaflow/backend:latest
ghcr.io/VOTRE-USERNAME/vitaflow/backend:main
ghcr.io/VOTRE-USERNAME/vitaflow/backend:v1.0.0

ghcr.io/VOTRE-USERNAME/vitaflow/frontend:latest
ghcr.io/VOTRE-USERNAME/vitaflow/frontend:main
ghcr.io/VOTRE-USERNAME/vitaflow/frontend:v1.0.0
```

## 💻 Utilisation

### Développement local

```bash
# Build et lancer (dev)
make build
make start

# Créer l'admin
make seed

# Voir les logs
make logs
```

### Commit et Push

```bash
# Ajouter les modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"

# Pousser sur develop (tests uniquement)
git push origin develop

# Pousser sur main (tests + build + push images)
git push origin main
```

### Créer une release

```bash
# Créer un tag
git tag v1.0.0
git push origin v1.0.0

# OU via l'interface GitHub
# Releases > New Release > Tag: v1.0.0
```

Le pipeline va :
1. ✅ Exécuter les tests
2. ✅ Builder les images Docker
3. ✅ Pousser avec les tags : `v1.0.0`, `1.0`, `latest`

## 🌐 Déploiement VPS

### Configuration initiale (une fois)

Connectez-vous à votre VPS et suivez [DEPLOY_VPS.md](./DEPLOY_VPS.md) :

```bash
# Sur le VPS
mkdir -p ~/vitaflow-prod && cd ~/vitaflow-prod

# Télécharger les fichiers
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/.env.prod.example
wget https://raw.githubusercontent.com/VOTRE-USERNAME/VitaFlow/main/Makefile

# Configuration
cp .env.prod.example .env
nano .env  # Éditer les variables
```

### Variables d'environnement (.env sur le VPS)

```bash
# GitHub
GITHUB_REPOSITORY=votre-username/VitaFlow
VERSION=latest  # ou v1.0.0 pour une version spécifique

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MONGO_DB=cabinet

# Backend
BACKEND_PORT=3001
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_PORT=80
```

### Premier déploiement

```bash
# Sur le VPS
cd ~/vitaflow-prod

# Télécharger et démarrer
make deploy

# Créer le compte admin
make deploy-seed
```

### Mise à jour de l'application

Après un push sur `main` qui a généré de nouvelles images :

```bash
# Sur le VPS
cd ~/vitaflow-prod

# 1. Stopper l'application
docker compose -f docker-compose.prod.yml down

# 2. Télécharger les nouvelles images
docker compose -f docker-compose.prod.yml pull

# 3. Démarrer avec les nouvelles images
docker compose -f docker-compose.prod.yml up -d

# 4. Vérifier
docker compose -f docker-compose.prod.yml ps
make deploy-logs
```

**OU avec une seule commande :**

```bash
make deploy
```

### Déployer une version spécifique

```bash
# Dans .env sur le VPS, changer :
VERSION=v1.0.0  # au lieu de "latest"

# Puis :
make deploy
```

## 🛠️ Commandes Makefile

### Développement

```bash
make help           # Afficher l'aide
make install        # Installer les dépendances
make build          # Build images Docker (dev)
make start          # Démarrer (dev)
make stop           # Arrêter
make restart        # Redémarrer
make logs           # Voir les logs
make seed           # Créer l'admin (dev)
make health         # Vérifier la santé
```

### Production

```bash
make deploy         # Déployer en production
make deploy-seed    # Créer l'admin (prod)
make deploy-logs    # Voir les logs
make deploy-status  # Voir l'état
make deploy-stop    # Arrêter
```

### Tests

```bash
make test-backend   # Tests backend
make test-frontend  # Tests frontend
make lint-backend   # Lint backend
make lint-frontend  # Lint frontend
```

### Maintenance

```bash
make backup         # Sauvegarder MongoDB
make clean          # Nettoyer tout (⚠️ supprime les données)
make status         # Voir l'état des conteneurs
```

## 🔄 Workflow complet

### 1. Développement local

```bash
# Développeur local
git clone https://github.com/VOTRE-USERNAME/VitaFlow
cd VitaFlow
make start
make seed

# Développement...
# Tests...
```

### 2. Commit et Tests

```bash
# Commit
git add .
git commit -m "feat: ajout de fonctionnalité X"
git push origin develop

# → GitHub Actions exécute les tests
```

### 3. Merge et Build

```bash
# Créer une PR : develop → main
# Après review et merge:

# → GitHub Actions :
#    - Exécute les tests
#    - Build les images Docker
#    - Push sur ghcr.io avec tag "main"
```

### 4. Release versionnée

```bash
# Créer un tag
git tag v1.0.0
git push origin v1.0.0

# → GitHub Actions :
#    - Exécute les tests
#    - Build les images Docker
#    - Push sur ghcr.io avec tags:
#      * v1.0.0
#      * 1.0
#      * latest
```

### 5. Déploiement VPS

```bash
# Sur le VPS
cd ~/vitaflow-prod
make deploy

# Ou pour une version spécifique:
# Éditer .env: VERSION=v1.0.0
make deploy
```

## 🔍 Vérification

### Vérifier le statut GitHub Actions

1. Aller sur https://github.com/VOTRE-USERNAME/VitaFlow/actions
2. Voir l'état du workflow "CI/CD Pipeline"
3. Cliquer sur un run pour voir les détails

### Vérifier les images

```bash
# Lister les images locales
docker images | grep vitaflow

# Voir les images sur GitHub
# https://github.com/VOTRE-USERNAME/VitaFlow/pkgs/container/vitaflow%2Fbackend
# https://github.com/VOTRE-USERNAME/VitaFlow/pkgs/container/vitaflow%2Ffrontend
```

### Vérifier le déploiement VPS

```bash
# Sur le VPS
make deploy-status

# Tester l'API
curl http://localhost:3001/api/health

# Voir les logs
make deploy-logs
```

## 🐛 Dépannage

### Build échoue sur GitHub Actions

```bash
# Vérifier les logs dans Actions
# Reproduire localement:
docker build -t test ./backend
docker build -t test ./frontend
```

### Image non trouvée sur le VPS

```bash
# Vérifier que l'image existe sur ghcr.io
# Vérifier le GITHUB_REPOSITORY dans .env

# Si repository privé, se connecter:
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Erreur de permissions GitHub

1. Aller dans Settings > Actions > General
2. Workflow permissions : "Read and write permissions"
3. Cocher "Allow GitHub Actions to create and approve pull requests"

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Guide de déploiement VPS](./DEPLOY_VPS.md)
- [Documentation complète](./DEPLOYMENT.md)

## ✅ Checklist avant le premier déploiement

- [ ] Repository GitHub créé et code poussé
- [ ] Workflow GitHub Actions activé
- [ ] VPS configuré avec Docker et Docker Compose
- [ ] Fichier `.env` créé sur le VPS avec valores sécurisés
- [ ] MongoDB : mot de passe changé
- [ ] JWT : secrets générés (JWT_SECRET et JWT_REFRESH_SECRET)
- [ ] Firewall configuré (ports 80, 443, 22)
- [ ] Images Docker publiées sur ghcr.io
- [ ] Premier déploiement testé : `make deploy`
- [ ] Compte admin créé : `make deploy-seed`
- [ ] Application accessible et login fonctionne
- [ ] HTTPS configuré (optionnel mais recommandé)

---

🎉 **Votre pipeline CI/CD est prêt !**
