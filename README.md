# VitaFlow 🏥

Application de gestion de cabinet médical avec authentification multi-rôles, gestion des patients, rendez-vous et comptabilité.

## 🚀 Stack Technique

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 5.2
- **Langage**: TypeScript 5.9 (mode strict)
- **Base de données**: MongoDB 7 (Mongoose ODM)
- **Authentification**: JWT (access + refresh tokens)
- **Sécurité**: bcrypt, CORS, validation middleware
- **Dev**: ts-node-dev (hot reload)

### Frontend (À venir)
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Query + Zustand
- React Router v6
- Capacitor (pour APK Android)

## 📁 Structure du Projet

```
VitaFlow/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # JWT, utils
│   │   ├── config/          # DB connection
│   │   ├── scripts/         # Seed data
│   │   └── server.ts        # Express app
│   ├── .env                 # Variables d'environnement
│   └── package.json
├── frontend/                # (À créer)
├── PROJECT_PLAN.md          # Plan détaillé (82 étapes)
├── PROGRESS.md              # Suivi du développement
└── README.md                # Ce fichier
```

## 🏁 Quick Start

### Prérequis
- Node.js 20+
- Docker (pour MongoDB)
- npm ou yarn

### Installation Backend

1. **Démarrer MongoDB avec Docker**
```bash
docker run -d \
  --name cabinet-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7
```

2. **Installer les dépendances**
```bash
cd backend
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Vérifier les variables dans .env
```

4. **Seed la base de données**
```bash
npm run seed
```

5. **Démarrer le serveur**
```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3001**

### Tester l'API

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vitaflow.com",
    "password": "Admin123!"
  }'

# Utiliser le token retourné pour les autres requêtes
```

Voir [backend/API_GUIDE.md](backend/API_GUIDE.md) pour la documentation complète.

## 📊 Fonctionnalités Actuelles

### ✅ Backend API Complète

**Authentification**
- Login/Logout avec JWT
- Refresh tokens (30j)
- Gestion des rôles (admin, médecin, assistant)
- Création d'utilisateurs (admin only)

**Gestion des Patients**
- CRUD complet
- ID auto-increment (jamais réassigné)
- Recherche et pagination
- Historique des consultations
- Calcul automatique des honoraires

**Gestion des Rendez-Vous**
- CRUD avec validation de chevauchement
- Filtrage par date, médecin, patient, statut
- Validation de durée (15min-3h)
- Statuts: planifié, confirmé, terminé, annulé

**Statistiques & Dashboard**
- Vue d'ensemble (patients, RDV, revenus)
- Revenus par mois/médecin
- Top patients par honoraires
- Stats RDV par statut

## 🔐 Comptes de Test

Après le seed, utilisez ces comptes:

```
Admin:
- Email: admin@vitaflow.com
- Mot de passe: Admin123!

Médecin:
- Email: medecin1@vitaflow.com
- Mot de passe: Medecin123!
```

## 📝 Endpoints API

### Base URL: `http://localhost:3001/api`

**Auth**
- `POST /auth/login` - Connexion
- `POST /auth/register` - Créer utilisateur (admin)
- `POST /auth/refresh` - Renouveler token
- `POST /auth/logout` - Déconnexion
- `GET /auth/me` - Profil utilisateur

**Patients**
- `GET /patients` - Liste avec pagination/recherche
- `GET /patients/:id` - Détails + historique
- `POST /patients` - Créer patient
- `PATCH /patients/:id` - Modifier patient
- `DELETE /patients/:id` - Supprimer patient
- `POST /patients/:id/soins` - Ajouter consultation

**Rendez-Vous**
- `GET /rendez-vous` - Liste avec filtres
- `GET /rendez-vous/:id` - Détails RDV
- `POST /rendez-vous` - Créer RDV
- `PATCH /rendez-vous/:id` - Modifier RDV
- `DELETE /rendez-vous/:id` - Annuler RDV

**Statistiques**
- `GET /stats/overview` - Vue d'ensemble
- `GET /stats/revenue` - Revenus
- `GET /stats/top-patients` - Top patients
- `GET /stats/appointments` - Stats RDV

## 🗄️ Modèles de Données

### User
```typescript
{
  email: string (unique)
  password: string (bcrypt)
  nom: string
  prenom: string
  role: 'admin' | 'medecin' | 'assistant'
  isActive: boolean
  refreshTokens: string[]
}
```

### Patient
```typescript
{
  id: number (auto-increment)
  nom: string
  prenom: string
  telephone?: string
  adresse?: string
  soins: [{
    date: Date
    description: string
    honoraire: number
    recu: string
    medecinId: ObjectId
    medecinNom: string
  }]
}
```

### RendezVous
```typescript
{
  patientId: ObjectId
  patientNom: string
  medecinId: ObjectId
  medecinNom: string
  date: Date
  heureDebut: string (HH:mm)
  heureFin: string (HH:mm)
  statut: 'planifie' | 'confirme' | 'termine' | 'annule'
  motif?: string
  notes?: string
}
```

### Counter
```typescript
{
  name: string (ex: "patientId")
  sequence: number
}
```

## 🛠️ Scripts NPM

```bash
npm run dev        # Démarrer en mode développement (hot reload)
npm run build      # Compiler TypeScript
npm start          # Démarrer en production
npm run seed       # Initialiser la base avec données de test
```

## 🔄 Prochaines Étapes

1. **Frontend React**
   - Init Vite + React + TypeScript
   - Setup Tailwind + shadcn/ui
   - Pages: Login, Dashboard, Patients, Rendez-vous
   - Intégration API avec axios

2. **Améliorations Backend** (optionnel)
   - Routes utilisateurs CRUD
   - Validation Zod
   - Rate limiting
   - Tests unitaires
   - Documentation Swagger

3. **Mobile (Capacitor)**
   - Configuration Android
   - Build APK
   - Tests sur appareil

4. **Déploiement**
   - Docker Compose
   - Variables d'environnement production
   - CI/CD si besoin

## 📖 Documentation

- [PROJECT_PLAN.md](PROJECT_PLAN.md) - Plan détaillé 82 étapes
- [PROGRESS.md](PROGRESS.md) - Suivi du développement
- [backend/API_GUIDE.md](backend/API_GUIDE.md) - Guide API complet
- [backend/README.md](backend/README.md) - Documentation backend

## 🐛 Troubleshooting

### Port 3001 déjà utilisé
Changer `PORT` dans `.env`

### MongoDB connection error
Vérifier que Docker container est démarré:
```bash
docker ps | grep cabinet-mongodb
```

### Token expired
Utiliser `/auth/refresh` pour renouveler le token

## 📄 Licence

Projet privé - VitaFlow © 2026

---

**Status**: 🟢 Backend API Complète ✅ | Frontend 📋 À faire
