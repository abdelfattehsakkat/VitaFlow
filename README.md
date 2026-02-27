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

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 3.4.0 (Apple-inspired design system)
- **State**: Zustand (auth) + React Query (data fetching)
- **Router**: React Router v6
- **Icons**: Lucide React
- **HTTP**: Axios
- **Mobile**: Capacitor (pour APK Android)

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
- Recherche et pagination (backend)
- Recherche intelligente (nom, prénom, téléphone, ID)
- Historique des consultations
- Calcul automatique des honoraires et balance

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
- Widget météo temps réel (OpenWeatherMap)

### ✅ Frontend React (Opérationnel)

**Interface Moderne**
- Design system Apple-inspired avec glassmorphism
- Sidebar élégante avec navigation fluide
- Dashboard avec statistiques et météo
- Liste des patients avec recherche et pagination
- Fiche patient détaillée avec historique consultations
- Formulaires d'ajout/modification (patients et consultations)
- Design responsive (mobile, tablette, desktop)

**Fonctionnalités**
- Authentification JWT complète
- Gestion patients : création, modification, suppression
- Consultations : ajout, modification, suppression inline
- Recherche multi-critères : nom, prénom, téléphone, ID
- Pagination côté serveur (optimisée)
- Affichage balance (Reçu - Honoraires) avec code couleur
- Widget météo Tunis en temps réel

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

## 🎨 Design System & Contributions UI/UX

VitaFlow utilise un design system Apple-inspired cohérent à travers toute l'application.

### 📚 Documentation Complète

**Pour les développeurs UI/UX, consultez impérativement :**
- **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)** - Guide complet du design system
- **[.github/CONTRIBUTING_UI.md](.github/CONTRIBUTING_UI.md)** - Guidelines de contribution UI
- **[.github/pull_request_template.md](.github/pull_request_template.md)** - Template de PR avec checklist UI

### ✨ Principes de Design

**Glassmorphism**
```tsx
// Toutes les cartes utilisent la transparence + backdrop blur
<div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60">
```

**Gradients & Shadows**
```tsx
// Boutons principaux avec gradients et ombres colorées
<button className="bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
```

**Animations Fluides**
```tsx
// Transitions douces sur toutes les interactions
hover:scale-105 hover:-translate-y-0.5 transition-all duration-200
```

**Espacements Généreux**
- `space-y-8` pour sections majeures
- `px-6 py-3` pour boutons principaux
- `p-6` ou `p-8` pour cartes
- `rounded-xl` et `rounded-2xl` (pas `rounded-lg`)

**Icons Lucide React**
```tsx
import { Users, Calendar, Edit2 } from 'lucide-react'
// Fini les emojis ! 
```

### 🎯 Composants Principaux

| Composant | Fichier | Documentation |
|-----------|---------|---------------|
| Sidebar Navigation | `layouts/DashboardLayout.tsx` | Gradient sombre + glassmorphism |
| Dashboard Stats | `pages/DashboardPage.tsx` | 6 gradients diversifiés |
| Liste Patients | `pages/PatientsPage.tsx` | Table interactive + search |
| Fiche Patient | `pages/PatientDetailsPage.tsx` | Cards avec hover effects |
| Formulaires | `pages/PatientDetailsPage.tsx` | Inputs rounded-xl + focus rings |
| Boutons CTA | Tous les fichiers | Gradient + shadow + hover lift |

### ✅ Checklist Contribution UI

Avant toute contribution UI :
- [ ] Lire [DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md) en entier
- [ ] Utiliser `rounded-xl` ou `rounded-2xl`
- [ ] Appliquer glassmorphism sur les cartes
- [ ] Ajouter transitions fluides (`transition-all duration-200`)
- [ ] Utiliser icons Lucide (pas d'emojis)
- [ ] Tester sur mobile, tablette et desktop
- [ ] Vérifier focus states (accessibilité)
- [ ] Pas d'erreurs TypeScript

### 🚀 Quick Start Frontend

```bash
cd frontend
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec VITE_OPENWEATHER_API_KEY

npm run dev
```

Frontend disponible sur **http://localhost:5173**

## 🔄 Prochaines Étapes

1. **Frontend - Pages Manquantes**
   - ✅ ~~Login page~~
   - ✅ ~~Dashboard~~
   - ✅ ~~Liste patients~~
   - ✅ ~~Fiche patient + consultations~~
   - ⏳ Page Rendez-vous (calendrier + liste)
   - ⏳ Gestion utilisateurs (admin)
   - ⏳ Formulaire nouveau patient (modal)

2. **Frontend - Améliorations**
   - ⏳ Tests unitaires (Vitest + React Testing Library)
   - ⏳ Animations page transitions
   - ⏳ Optimisations performances (lazy loading)
   - ⏳ PWA (offline support)

3. **Backend - Améliorations**
   - ⏳ Routes utilisateurs CRUD complètes
   - ⏳ Validation Zod sur tous les endpoints
   - ⏳ Rate limiting
   - ⏳ Tests unitaires + intégration
   - ⏳ Documentation Swagger/OpenAPI

4. **Mobile (Capacitor)**
   - ⏳ Configuration Android
   - ⏳ Build APK
   - ⏳ Tests sur appareil
   - ⏳ Permissions (caméra, notifications)

5. **Déploiement**
   - ⏳ Docker Compose (backend + frontend + MongoDB)
   - ⏳ Variables d'environnement production
   - ⏳ CI/CD GitHub Actions
   - ⏳ Hébergement (VPS, cloud)

## 📖 Documentation

### Général
- [PROJECT_PLAN.md](PROJECT_PLAN.md) - Plan détaillé 82 étapes
- [PROGRESS.md](PROGRESS.md) - Suivi du développement

### Backend
- [backend/README.md](backend/README.md) - Documentation backend
- [backend/API_GUIDE.md](backend/API_GUIDE.md) - Guide API complet

### Frontend & Design
- **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)** - 📚 **Design system complet (OBLIGATOIRE)**
- [frontend/README.md](frontend/README.md) - Documentation frontend
- [frontend/src/config/README.md](frontend/src/config/README.md) - Configuration météo

### Contribution
- [.github/CONTRIBUTING_UI.md](.github/CONTRIBUTING_UI.md) - Guidelines UI/UX
- [.github/pull_request_template.md](.github/pull_request_template.md) - Template PR avec checklist
- [.github/ISSUE_TEMPLATE/design_ui.md](.github/ISSUE_TEMPLATE/design_ui.md) - Template d'issue design

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
