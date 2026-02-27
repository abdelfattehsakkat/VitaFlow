# GitHub Actions Workflow - VitaFlow

Configuration du pipeline CI/CD pour VitaFlow.

## 📁 Fichier

`.github/workflows/ci-cd.yml`

## 🎯 Déclencheurs

### Push sur branches principales
```yaml
on:
  push:
    branches: [ main, develop ]
```
- **Action** : Tests + Build + Push images Docker

### Tags de version
```yaml
on:
  push:
    tags:
      - 'v*'
```
- **Action** : Tests + Build + Push images avec versions (v1.0.0, 1.0, latest)

### Pull Requests
```yaml
on:
  pull_request:
    branches: [ main, develop ]
```
- **Action** : Tests uniquement (pas de build)

## 🏗️ Jobs

### 1. test-backend
- Checkout du code
- Setup Node.js 20
- Installation dépendances (`npm ci`)
- Lint (si configuré)
- Tests (`npm test`)

### 2. test-frontend
- Checkout du code
- Setup Node.js 20
- Installation dépendances (`npm ci`)
- Lint (`npm run lint`)
- Build (`npm run build`)

### 3. build-backend
**Dépendances** : `test-backend`

**Conditions** : 
- Push sur `main` OU
- Tag `v*`

**Actions** :
- Setup Docker Buildx
- Login sur ghcr.io (GitHub Container Registry)
- Build image multi-architecture (amd64, arm64)
- Push avec tags appropriés

### 4. build-frontend
**Dépendances** : `test-frontend`

**Conditions** : 
- Push sur `main` OU
- Tag `v*`

**Actions** :
- Setup Docker Buildx
- Login sur ghcr.io
- Build image multi-architecture (amd64, arm64)
- Push avec tags appropriés

## 🐳 Images Docker

### Registre
GitHub Container Registry (ghcr.io)

### Nomenclature

```
ghcr.io/{GITHUB_REPOSITORY}/backend:{TAG}
ghcr.io/{GITHUB_REPOSITORY}/frontend:{TAG}
```

### Tags générés

**Pour un push sur main :**
```
ghcr.io/username/vitaflow/backend:main
ghcr.io/username/vitaflow/backend:main-abc1234
```

**Pour un tag v1.0.0 :**
```
ghcr.io/username/vitaflow/backend:v1.0.0
ghcr.io/username/vitaflow/backend:1.0
ghcr.io/username/vitaflow/backend:latest
```

## 🔐 Permissions

Le workflow nécessite les permissions suivantes :

```yaml
permissions:
  contents: read      # Lire le code
  packages: write     # Publier sur ghcr.io
```

Ces permissions sont configurées automatiquement via `GITHUB_TOKEN`.

## ⚙️ Configuration Repository

### 1. Activer les Actions

**Settings** → **Actions** → **General**

- **Actions permissions** : Allow all actions
- **Workflow permissions** : Read and write permissions
- Cocher : "Allow GitHub Actions to create and approve pull requests"

### 2. Rendre les images publiques (optionnel)

**Packages** → Sélectionner un package → **Package settings**

- **Change visibility** : Public

## 🧪 Tester localement

### Tests
```bash
# Backend
cd backend
npm ci
npm test
npm run lint

# Frontend
cd frontend
npm ci
npm test
npm run lint
npm run build
```

### Build Docker
```bash
# Backend
docker build -t vitaflow-backend ./backend

# Frontend
docker build -t vitaflow-frontend ./frontend
```

## 🚀 Workflow de Release

### 1. Développement sur feature branch
```bash
git checkout -b feature/ma-fonctionnalite
# ... développement ...
git push origin feature/ma-fonctionnalite
```

### 2. Pull Request vers develop
```bash
# Créer une PR : feature/ma-fonctionnalite → develop
```
→ GitHub Actions exécute les tests

### 3. Merge dans develop
```bash
git checkout develop
git merge feature/ma-fonctionnalite
git push origin develop
```
→ GitHub Actions : Tests + Build + Push images avec tag `develop`

### 4. Merge dans main (release)
```bash
git checkout main
git merge develop
git push origin main
```
→ GitHub Actions : Tests + Build + Push images avec tag `main`

### 5. Créer un tag de version
```bash
git tag v1.0.0
git push origin v1.0.0
```
→ GitHub Actions : Tests + Build + Push images avec tags `v1.0.0`, `1.0`, `latest`

## 📊 Monitoring

### Voir l'état des workflows

**GitHub** → **Actions**

- Liste de tous les workflow runs
- Statut : Success ✅ / Failed ❌ / In Progress 🟡
- Logs détaillés par job

### Voir les images

**GitHub** → **Packages**

- Liste des images publiées
- Tags disponibles
- Taille des images
- Date de publication

### Badges (optionnel)

Ajouter dans `README.md` :

```markdown
![CI/CD](https://github.com/USERNAME/VitaFlow/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## 🐛 Dépannage

### Build échoue

**Vérifier** :
- Les tests passent localement ?
- Le Dockerfile build localement ?
- Les dépendances sont dans package.json ?

```bash
# Tester le build localement
docker build -t test ./backend
docker build -t test ./frontend
```

### Push image échoue

**Vérifier** :
- Permissions du workflow (Settings → Actions → General)
- GITHUB_TOKEN a accès aux packages
- Le nom du repository est correct

### Tests échouent

**Vérifier** :
- Les tests passent localement : `npm test`
- Les variables d'environnement nécessaires
- Les dépendances sont installées

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Metadata Action](https://github.com/docker/metadata-action)

## 🔄 Mise à jour du Workflow

Pour modifier le workflow :

1. Éditer `.github/workflows/ci-cd.yml`
2. Commit et push
3. Le nouveau workflow s'applique immédiatement

## ✅ Checklist

- [ ] Actions activées dans Settings
- [ ] Workflow permissions : Read and write
- [ ] Tests passent localement
- [ ] Docker build fonctionne localement
- [ ] Repository name correct dans docker-compose.prod.yml
- [ ] Images publiées sur ghcr.io après premier push
- [ ] VPS configuré pour pull depuis ghcr.io

---

Pour déployer les images sur VPS : voir [DEPLOY_VPS.md](../DEPLOY_VPS.md)
