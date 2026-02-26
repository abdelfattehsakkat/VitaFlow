# VitaFlow - Plan d'Implémentation Complet
## Application de Gestion de Cabinet Médical

**Date de création**: 26 Février 2026  
**Architecture**: Backend API (Node.js/Express) + Frontend Web (React/Vite) + Mobile (Capacitor)  
**Déploiement**: Docker Compose sur VPS OVH

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Stack Technologique](#stack-technologique)
4. [Modèles de Données](#modèles-de-données)
5. [Plan d'Implémentation Détaillé](#plan-dimplémentation-détaillé)
6. [Vérification et Tests](#vérification-et-tests)
7. [Décisions Techniques](#décisions-techniques)

---

## Vue d'Ensemble

### Objectif
Créer une application complète de gestion de cabinet médical permettant la gestion des patients, consultations, rendez-vous et statistiques comptables. L'application sera accessible via navigateur web (desktop et mobile) et disponible sous forme d'APK Android.

### Fonctionnalités Principales

#### 1. Authentification et Gestion des Utilisateurs
- Système d'authentification JWT avec refresh tokens
- 3 profils utilisateurs: **Admin**, **Médecin**, **Assistant**
- Seul l'admin peut gérer les utilisateurs (CRUD complet)
- Gestion des permissions par rôle

#### 2. Gestion des Fiches Patients
- **ID unique auto-incrémental** sans réattribution (exigence critique)
- Champs obligatoires: Nom, Prénom
- Champs optionnels: Téléphone, Adresse
- Historique des soins avec:
  - Date (obligatoire)
  - Description des soins (obligatoire)
  - Honoraire (obligatoire)
  - Numéro de reçu (obligatoire)
  - Médecin associé (auto-rempli)

#### 3. Calendrier de Rendez-vous
- Création de RDV avec recherche patient ou création rapide
- Gestion des horaires (début/fin)
- Modification et déplacement de créneaux (drag & drop)
- Statuts: planifié, confirmé, terminé, annulé
- Vues: jour, semaine, mois

#### 4. Dashboard et Statistiques
- Revenus par jour, mois, patient
- Métriques clés: total patients, RDV aujourd'hui, revenus mois
- Graphiques temporels (revenus sur période)
- Top patients par revenu
- Filtres par période et médecin

#### 5. Design et Accessibilité
- Design élégant et professionnel (thème médical)
- Responsive: optimisé desktop, tablette, mobile (Android/iOS)
- Interface intuitive avec composants shadcn/ui
- Accessible via navigateur et APK natif

---

## Architecture Technique

### Structure du Projet

```
VitaFlow/
├── backend/              # API REST Node.js/Express
│   ├── src/
│   │   ├── config/       # Configuration DB, env
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Logique métier
│   │   ├── routes/       # Définition routes API
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── services/     # Services (auth, stats)
│   │   ├── utils/        # Helpers, logger
│   │   └── server.ts     # Point d'entrée
│   ├── Dockerfile
│   └── package.json
│
├── frontend/             # Application React/Vite
│   ├── src/
│   │   ├── pages/        # Pages React Router
│   │   ├── components/   # Composants réutilisables
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   └── Layout/   # Layout, Sidebar, Header
│   │   ├── services/     # API clients (axios)
│   │   ├── store/        # Zustand stores
│   │   ├── hooks/        # Custom hooks
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Helpers
│   │   └── App.tsx       # Router principal
│   ├── android/          # Projet Capacitor Android
│   ├── ios/              # Projet Capacitor iOS
│   ├── capacitor.config.ts
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                # Configuration reverse proxy
│   └── nginx.conf
│
├── scripts/              # Scripts backup, restore
│   ├── backup.sh
│   └── restore.sh
│
├── docker-compose.yml    # Orchestration containers
├── .env.example          # Variables d'environnement
├── DEPLOY.md             # Guide déploiement
└── README.md             # Documentation principale
```

### Flux de Données

```
Mobile App (APK) ────┐
                     │
Web Browser ─────────┼──→ Nginx (reverse proxy) ──→ Frontend (React)
                     │                                      │
                     │                                      │
                     └───────────────────────────→ Backend API (Express)
                                                            │
                                                            ↓
                                                      MongoDB
```

**Environnements:**
- **Développement**: Backend (localhost:5000) + Frontend (localhost:5173) + MongoDB local
- **Production**: Tout containerisé via Docker Compose sur VPS avec Nginx SSL

---

## Stack Technologique

### Backend API
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 20 LTS | Runtime JavaScript |
| Express.js | ^4.18 | Framework web REST API |
| TypeScript | ^5.3 | Typage statique |
| MongoDB | 7 | Base de données NoSQL |
| Mongoose | ^8.0 | ODM MongoDB (schemas, validation) |
| bcryptjs | ^2.4 | Hashing mots de passe |
| jsonwebtoken | ^9.0 | Génération/validation JWT |
| zod | ^3.22 | Validation schemas |
| winston | ^3.11 | Logging |
| helmet | ^7.1 | Sécurité headers HTTP |
| express-rate-limit | ^7.1 | Rate limiting |
| cors | ^2.8 | Configuration CORS |

### Frontend Web
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | ^18.2 | Library UI |
| Vite | ^5.0 | Build tool ultra-rapide |
| TypeScript | ^5.3 | Typage statique |
| React Router | ^6.21 | Routing SPA |
| Tailwind CSS | ^3.4 | Framework CSS utility-first |
| shadcn/ui | latest | Composants UI (copiés dans projet) |
| axios | ^1.6 | Client HTTP |
| @tanstack/react-query | ^5.17 | State management async, cache |
| zustand | ^4.4 | State management global léger |
| react-hook-form | ^7.49 | Gestion formulaires |
| @fullcalendar/react | ^6.1 | Calendrier interactif |
| recharts | ^2.10 | Graphiques statistiques |
| lucide-react | ^0.303 | Icons |

### Mobile Natif
| Technologie | Version | Usage |
|-------------|---------|-------|
| Capacitor | ^5.6 | Bridge web → natif |
| @capacitor/android | ^5.6 | Plateforme Android |
| @capacitor/ios | ^5.6 | Plateforme iOS |
| @capacitor/status-bar | ^5.0 | Contrôle barre statut |
| @capacitor/splash-screen | ^5.0 | Splash screen natif |
| @capacitor/network | ^5.0 | Détection connexion |
| @capacitor/app | ^5.0 | Lifecycle app native |

### DevOps et Déploiement
| Technologie | Usage |
|-------------|-------|
| Docker | Containerisation |
| Docker Compose | Orchestration multi-containers |
| Nginx | Reverse proxy, SSL termination |
| Let's Encrypt (Certbot) | Certificats SSL gratuits |
| GitHub | Version control |
| MongoDB Atlas (backup) | Backup cloud optionnel |

---

## Modèles de Données

### 1. User (Utilisateurs)

**Collection:** `users`

```typescript
{
  _id: ObjectId,
  email: string,              // Unique, lowercase, required
  password: string,           // Hashed bcrypt, required, select: false
  nom: string,                // Required
  prenom: string,             // Required
  role: 'admin' | 'medecin' | 'assistant',  // Required
  telephone?: string,         // Optional
  isActive: boolean,          // Default: true
  refreshTokens: string[],    // JWTs valides pour invalidation
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ role: 1 }` (filtres)

**Méthodes:**
- `comparePassword(candidatePassword: string): Promise<boolean>`
- `hashPassword(password: string): Promise<string>` (static)

---

### 2. Patient (Patients)

**Collection:** `patients`

```typescript
{
  _id: ObjectId,
  id: number,                 // Auto-increment, unique, immutable, CRITICAL
  nom: string,                // Required, trim
  prenom: string,             // Required, trim
  telephone?: string,         // Optional
  adresse?: string,           // Optional
  soins: [                    // Array embedded
    {
      _id: ObjectId,          // Auto-généré Mongoose
      date: Date,             // Required, default: Date.now
      description: string,    // Required (description des soins)
      honoraire: number,      // Required, min: 0
      recu: string,           // Required (numéro reçu)
      medecinId: ObjectId,    // Required, ref: 'User'
      medecinNom: string,     // Denormalisé pour performance
      createdAt: Date         // Timestamp création
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ id: 1 }` (unique) ← **CRITIQUE: ID séquentiel**
- `{ nom: 1, prenom: 1 }` (compound pour recherche)
- `{ nom: 'text', prenom: 'text' }` (text search)

**Virtuals:**
- `totalHonoraires`: sum de tous les honoraires
- `derniereSoin`: soin le plus récent (tri par date desc)

**Hooks:**
- Pre-save: si ajout soin, populate `medecinNom` depuis User

**Notes importantes:**
- L'ID auto-incrémental est **IMMUTABLE** et **JAMAIS réattribué**
- Implémentation via collection `counters` (atomique)

---

### 3. RendezVous (Rendez-vous)

**Collection:** `rendezvous`

```typescript
{
  _id: ObjectId,
  patientId: ObjectId,        // Required, ref: 'Patient'
  patientNom: string,         // Denormalisé (Nom Prénom)
  medecinId: ObjectId,        // Required, ref: 'User'
  medecinNom: string,         // Denormalisé
  date: Date,                 // Required (jour du RDV)
  heureDebut: string,         // Required, format "HH:mm" (ex: "14:30")
  heureFin: string,           // Required, format "HH:mm" (ex: "15:00")
  statut: 'planifie' | 'confirme' | 'termine' | 'annule',  // Default: 'planifie'
  motif?: string,             // Optional
  notes?: string,             // Optional
  createdBy: ObjectId,        // Ref: 'User' (qui a créé)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ date: 1, medecinId: 1 }` (queries calendrier)
- `{ patientId: 1, date: -1 }` (historique patient)

**Validation custom:**
- `heureDebut < heureFin`
- Durée minimum: 15 minutes
- Durée maximum: 3 heures
- Pas de chevauchement pour même médecin (validation controller)

**Notes:**
- Soft delete: utiliser `statut: 'annule'` au lieu de DELETE

---

### 4. Counter (Compteurs Auto-increment)

**Collection:** `counters`

```typescript
{
  _id: string,                // Nom du compteur (ex: "patientId")
  sequence: number            // Valeur actuelle
}
```

**Documents:**
- `{ _id: "patientId", sequence: 0 }` (initialisé par seed)

**Helper Function:**
```typescript
async function getNextSequence(counterName: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
}
```

**Utilisation:**
```typescript
// Lors de création patient
const id = await getNextSequence('patientId');
const patient = new Patient({ id, nom, prenom, ... });
```

**Garanties:**
- Atomicité MongoDB: `findOneAndUpdate` avec `$inc`
- Thread-safe: pas de race conditions
- **JAMAIS** décrementer ou réutiliser IDs supprimés

---

## Plan d'Implémentation Détaillé

### PHASE 1: Setup Backend API

#### Step 1: Initialiser projet backend
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev
npx tsc --init
```

**Fichiers à créer:**
- `backend/tsconfig.json`: configuration TypeScript strict
- `backend/package.json`: scripts `dev`, `build`, `start`
- `backend/.env.example`: template variables
- `backend/.gitignore`: `node_modules/`, `dist/`, `.env`

**Structure dossiers:**
```bash
mkdir -p src/{config,models,controllers,routes,middleware,services,utils}
```

---

#### Step 2: Configuration MongoDB
**Fichier:** `backend/src/config/db.ts`

```typescript
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.MONGODB_DB_NAME || 'vitaflow',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

---

#### Step 3: Server Express de base
**Fichier:** `backend/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (à ajouter)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
```

---

#### Step 4: Variables d'environnement
**Fichier:** `backend/.env.example`

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=vitaflow

# JWT
JWT_SECRET=votre_secret_super_securise_a_changer_en_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=autre_secret_pour_refresh_tokens
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Instructions:**
1. Copier `.env.example` → `.env`
2. Modifier les secrets en production (générer avec `openssl rand -base64 32`)
3. Ne JAMAIS commiter `.env` (dans .gitignore)

---

### PHASE 2: Modèles Mongoose

#### Step 5: Modèle User
**Fichier:** `backend/src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'medecin' | 'assistant';
  telephone?: string;
  isActive: boolean;
  refreshTokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [8, 'Mot de passe minimum 8 caractères'],
    select: false
  },
  nom: {
    type: String,
    required: [true, 'Nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Prénom est requis'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'assistant'],
    required: [true, 'Rôle est requis']
  },
  telephone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    type: String
  }]
}, {
  timestamps: true
});

// Hash password avant save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Méthode compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode statique hash password
userSchema.statics.hashPassword = async function(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, rounds);
};

export default mongoose.model<IUser>('User', userSchema);
```

---

#### Step 6: Modèle Counter (pour auto-increment)
**Fichier:** `backend/src/models/Counter.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.model<ICounter>('Counter', counterSchema);

export const getNextSequence = async (counterName: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
};

export default Counter;
```

---

#### Step 7: Modèle Patient
**Fichier:** `backend/src/models/Patient.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

interface ISoin {
  _id: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  honoraire: number;
  recu: string;
  medecinId: mongoose.Types.ObjectId;
  medecinNom: string;
  createdAt: Date;
}

export interface IPatient extends Document {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  soins: ISoin[];
  totalHonoraires: number;
  derniereSoin?: ISoin;
  createdAt: Date;
  updatedAt: Date;
}

const soinSchema = new Schema<ISoin>({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description des soins est requise'],
    trim: true
  },
  honoraire: {
    type: Number,
    required: [true, 'Honoraire est requis'],
    min: [0, 'Honoraire doit être positif']
  },
  recu: {
    type: String,
    required: [true, 'Numéro de reçu est requis'],
    trim: true
  },
  medecinId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medecinNom: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const patientSchema = new Schema<IPatient>({
  id: {
    type: Number,
    unique: true,
    immutable: true
  },
  nom: {
    type: String,
    required: [true, 'Nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Prénom est requis'],
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  adresse: {
    type: String,
    trim: true
  },
  soins: [soinSchema]
}, {
  timestamps: true
});

// Index pour recherche
patientSchema.index({ nom: 1, prenom: 1 });
patientSchema.index({ id: 1 }, { unique: true });
patientSchema.index({ nom: 'text', prenom: 'text' });

// Virtual: total honoraires
patientSchema.virtual('totalHonoraires').get(function() {
  return this.soins.reduce((sum, soin) => sum + soin.honoraire, 0);
});

// Virtual: dernière soin
patientSchema.virtual('derniereSoin').get(function() {
  if (this.soins.length === 0) return null;
  return this.soins.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
});

// Pre-save: générer ID auto-increment
patientSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.id = await getNextSequence('patientId');
  }
  next();
});

// Pre-save: populate medecinNom si nouveau soin
patientSchema.pre('save', async function(next) {
  if (this.isModified('soins')) {
    const User = mongoose.model('User');
    for (const soin of this.soins) {
      if (!soin.medecinNom && soin.medecinId) {
        const medecin = await User.findById(soin.medecinId).select('nom prenom');
        if (medecin) {
          soin.medecinNom = `${medecin.nom} ${medecin.prenom}`;
        }
      }
    }
  }
  next();
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPatient>('Patient', patientSchema);
```

---

#### Step 8: Modèle RendezVous
**Fichier:** `backend/src/models/RendezVous.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IRendezVous extends Document {
  patientId: mongoose.Types.ObjectId;
  patientNom: string;
  medecinId: mongoose.Types.ObjectId;
  medecinNom: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  statut: 'planifie' | 'confirme' | 'termine' | 'annule';
  motif?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rendezvousSchema = new Schema<IRendezVous>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientNom: {
    type: String,
    required: true
  },
  medecinId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medecinNom: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date est requise']
  },
  heureDebut: {
    type: String,
    required: [true, 'Heure de début est requise'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide (HH:mm)']
  },
  heureFin: {
    type: String,
    required: [true, 'Heure de fin est requise'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide (HH:mm)']
  },
  statut: {
    type: String,
    enum: ['planifie', 'confirme', 'termine', 'annule'],
    default: 'planifie'
  },
  motif: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
rendezvousSchema.index({ date: 1, medecinId: 1 });
rendezvousSchema.index({ patientId: 1, date: -1 });

// Validation custom: heureDebut < heureFin
rendezvousSchema.pre('validate', function(next) {
  if (this.heureDebut >= this.heureFin) {
    return next(new Error('Heure de début doit être avant heure de fin'));
  }
  
  // Vérifier durée (15min - 3h)
  const [h1, m1] = this.heureDebut.split(':').map(Number);
  const [h2, m2] = this.heureFin.split(':').map(Number);
  const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  
  if (minutes < 15) {
    return next(new Error('Durée minimum: 15 minutes'));
  }
  if (minutes > 180) {
    return next(new Error('Durée maximum: 3 heures'));
  }
  
  next();
});

export default mongoose.model<IRendezVous>('RendezVous', rendezvousSchema);
```

---

### PHASE 3: Authentication Backend

#### Step 9: Service Auth
**Fichier:** `backend/src/services/authService.ts`

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

export const verifyToken = (token: string, type: 'access' | 'refresh'): JWTPayload => {
  const secret = type === 'access' ? process.env.JWT_SECRET! : process.env.JWT_REFRESH_SECRET!;
  return jwt.verify(token, secret) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, rounds);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
```

---

#### Step 10: Middleware Auth
**Fichier:** `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token manquant. Veuillez vous authentifier.'
      });
      return;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token, 'access');
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
      return;
    }
    
    next();
  };
};
```

---

#### Step 11: Validation Schemas
**Fichier:** `backend/src/utils/validation.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  role: z.enum(['admin', 'medecin', 'assistant']),
  telephone: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const createPatientSchema = z.object({
  nom: z.string().min(1, 'Nom requis').trim(),
  prenom: z.string().min(1, 'Prénom requis').trim(),
  telephone: z.string().optional(),
  adresse: z.string().optional()
});

export const addSoinSchema = z.object({
  date: z.string().datetime().or(z.date()),
  description: z.string().min(1, 'Description requise'),
  honoraire: z.number().min(0, 'Honoraire doit être positif'),
  recu: z.string().min(1, 'Numéro de reçu requis'),
  medecinId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID médecin invalide')
});

export const createRendezVousSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID patient invalide'),
  medecinId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID médecin invalide'),
  date: z.string().datetime().or(z.date()),
  heureDebut: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide'),
  heureFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide'),
  motif: z.string().optional(),
  notes: z.string().optional()
});

export const updateRendezVousSchema = createRendezVousSchema.partial().extend({
  statut: z.enum(['planifie', 'confirme', 'termine', 'annule']).optional()
});

// Middleware validation
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation échouée',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
};
```

---

### PHASE 4: Routes et Controllers Backend

#### Step 12: Auth Controller
**Fichier:** `backend/src/controllers/authController.ts`

```typescript
import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../services/authService';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, nom, prenom, role, telephone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà utilisé'
      });
    }
    
    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      role,
      telephone
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    
    user.refreshTokens.push(refreshToken);
    await user.save();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          telephone: user.telephone
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      });
    }
    
    const decoded = verifyToken(refreshToken, 'refresh');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide'
      });
    }
    
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());
    
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user.userId, {
        $pull: { refreshTokens: refreshToken }
      });
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        telephone: user.telephone,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

---

#### Step 13: Auth Routes
**Fichier:** `backend/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../utils/validation';
import { loginSchema, createUserSchema } from '../utils/validation';

const router = Router();

router.post('/register', authenticate, authorize('admin'), validate(createUserSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
```

---

#### Step 14: Patient Controller (extrait clé)
**Fichier:** `backend/src/controllers/patientController.ts`

```typescript
import { Response } from 'express';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'id' } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort({ [String(sortBy)]: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-soins'),
      Patient.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body;
    
    const patient = await Patient.create({
      nom,
      prenom,
      telephone,
      adresse,
      soins: []
    });
    
    res.status(201).json({
      success: true,
      message: `Patient créé avec ID ${patient.id}`,
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSoin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, description, honoraire, recu, medecinId } = req.body;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    
    patient.soins.push({
      date,
      description,
      honoraire,
      recu,
      medecinId,
      medecinNom: '', // sera populate par pre-save hook
      createdAt: new Date()
    } as any);
    
    await patient.save();
    
    res.json({
      success: true,
      message: 'Consultation ajoutée',
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

*Note: Les controllers pour User, RendezVous, et Stats suivent le même pattern. Voir structure complète dans les steps 15-17 du plan détaillé.*

---

### PHASE 5: Setup Frontend React

#### Step 18: Initialiser Frontend
```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom axios @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install recharts lucide-react date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configuration Tailwind:** `frontend/tailwind.config.js`
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
```

---

#### Step 19: Installer shadcn/ui
```bash
npx shadcn-ui@latest init
# Choisir: TypeScript, Tailwind, style default

# Ajouter composants
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
```

Composants créés dans `src/components/ui/`

---

#### Step 20: API Client Configuration
**Fichier:** `frontend/src/services/api.ts`

```typescript
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: attacher token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: refresh token si 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

#### Step 21: Variables d'environnement Frontend
**Fichier:** `frontend/.env.example`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=VitaFlow
```

---

### PHASE 6: Auth Frontend

#### Step 22: Auth Store (Zustand)
**Fichier:** `frontend/src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'medecin' | 'assistant';
  telephone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

#### Step 23: Auth Hook
**Fichier:** `frontend/src/hooks/useAuth.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  return useAuthStore();
};

export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  return { isAuthenticated };
};

export const useRequireRole = (allowedRoles: string[]) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && !allowedRoles.includes(user.role)) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);
  
  return { hasAccess: user ? allowedRoles.includes(user.role) : false };
};
```

---

#### Step 24: Login Page
**Fichier:** `frontend/src/pages/Login.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data.data;
      
      setAuth(user, accessToken, refreshToken);
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${user.prenom}!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.response?.data?.message || 'Email ou mot de passe incorrect',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">VF</span>
          </div>
          <CardTitle className="text-2xl">VitaFlow</CardTitle>
          <p className="text-sm text-gray-600">Gestion Cabinet Médical</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### PHASE 7-12: Frontend Pages & Components

*Note: Les phases 7-12 contiennent les implémentations détaillées de:*
- **Phase 7**: React Router setup, DashboardLayout, Sidebar, Header
- **Phase 8**: Pages Patients (liste, détail, dialogs)
- **Phase 9**: Page Calendrier avec FullCalendar
- **Phase 10**: Dashboard avec stats et graphiques Recharts
- **Phase 11**: Gestion Users (admin only)
- **Phase 12**: Responsive design et composants mobile

*Suivre les Steps 26-48 du plan initial pour implémentation complète.*

---

### PHASE 13: Capacitor Mobile

#### Step 49: Installer Capacitor
```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npx cap init VitaFlow com.vitaflow.app
```

**Configuration:** `frontend/capacitor.config.ts`
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitaflow.app',
  appName: 'VitaFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3b82f6',
    },
  },
};

export default config;
```

---

#### Step 50-57: Build et Deploy Mobile
```bash
# Ajouter plateformes
npx cap add android
npx cap add ios

# Installer plugins
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/network @capacitor/app

# Build web
npm run build

# Sync vers natif
npx cap sync

# Ouvrir Android Studio
npx cap open android

# Build APK release
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

**Configuration production:**
- Modifier `VITE_API_URL` avant build: `https://api.votredomaine.com`
- Générer keystore pour signature APK
- Configurer icons et splash screens (512x512, 1024x1024)

---

### PHASE 14-15: Sécurité et Tests

#### Step 58-64: Sécurité Backend
- Validation Zod sur toutes routes
- Rate limiting (express-rate-limit)
- Helmet security headers
- CORS whitelist strict
- Sanitization MongoDB injection
- Logging Winston avec rotation

#### Step 65-68: Tests
- **Backend**: Jest + Supertest
  - Tests modèles (auto-increment ID critique)
  - Tests routes auth (login, refresh)
  - Tests CRUD patients
- **Frontend**: Vitest + Testing Library
  - Tests composants formulaires
  - Tests hooks useAuth
  - Snapshots UI

---

### PHASE 16: Docker et Déploiement

#### Step 69-75: Configuration Docker

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_DATABASE: vitaflow
    volumes:
      - mongo-data:/data/db
    networks:
      - vitaflow-network

  backend:
    build: ./backend
    restart: always
    env_file:
      - .env
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - vitaflow-network

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ${VITE_API_URL}
    restart: always
    networks:
      - vitaflow-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend
    networks:
      - vitaflow-network

volumes:
  mongo-data:

networks:
  vitaflow-network:
    driver: bridge
```

**.env production:**
```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017
MONGODB_DB_NAME=vitaflow
JWT_SECRET=GENERER_SECRET_SECURISE_64_CHARS
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=AUTRE_SECRET_SECURISE_64_CHARS
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=https://vitaflow.votredomaine.com

# Frontend (build arg)
VITE_API_URL=https://api.votredomaine.com
```

**Nginx reverse proxy:** `nginx/nginx.conf`
```nginx
server {
    listen 80;
    server_name api.votredomaine.com;
    
    location / {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name vitaflow.votredomaine.com;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
    }
}
```

**Déploiement sur VPS:**
```bash
# Sur VPS OVH
git clone https://github.com/votreuser/vitaflow.git
cd vitaflow
cp .env.example .env
# Éditer .env avec vrais secrets

# Lancer
docker-compose up -d --build

# Logs
docker-compose logs -f

# SSL avec Certbot
sudo certbot --nginx -d vitaflow.votredomaine.com -d api.votredomaine.com
```

---

## Vérification et Tests

### Tests Développement Local

**Backend:**
```bash
cd backend
npm run dev  # Port 5000
npm test     # Tests Jest
```

**Frontend:**
```bash
cd frontend
npm run dev  # Port 5173
npm test     # Tests Vitest
```

**MongoDB:**
```bash
docker run -d -p 27017:27017 --name vitaflow-mongo mongo:7
```

**Checklist Tests Manuels:**
- [ ] Login avec admin/médecin/assistant
- [ ] Créer patient → ID incrémental correct
- [ ] Ajouter consultation → honoraires enregistrés
- [ ] Créer RDV → apparaît dans calendrier
- [ ] Modifier RDV → changements persistés
- [ ] Annuler RDV → statut 'annule' (soft delete)
- [ ] Dashboard → stats correctes (somme honoraires)
- [ ] Permissions rôles → assistant ne voit pas gestion users
- [ ] Recherche patient → suggestions temps réel
- [ ] Pagination liste patients → fonctionne

---

### Tests Responsive

**Chrome DevTools Emulation:**
- [ ] iPhone 13 Pro (390x844) - Safari iOS
- [ ] Galaxy S21 (360x800) - Chrome Android
- [ ] iPad Air (820x1180) - Safari iPadOS
- [ ] Desktop 1920x1080

**Vérifications:**
- [ ] Sidebar → drawer mobile < 768px
- [ ] Tables → cards empilées mobile
- [ ] Formulaires → full-width mobile
- [ ] Touch targets → min 44x44px
- [ ] Navigation → bottom nav mobile visible

---

### Tests APK Mobile

```bash
cd frontend
npm run build
npx cap sync
npx cap run android  # Sur émulateur ou device
```

**Checklist APK:**
- [ ] Installation APK réussie
- [ ] Splash screen affiché
- [ ] Login fonctionne → appelle API VPS
- [ ] Navigation fluide
- [ ] Formulaires keyboard friendly
- [ ] Network offline → message erreur approprié
- [ ] Status bar couleur correcte
- [ ] Back button Android fonctionne

---

### Tests Docker Production

```bash
docker-compose up -d --build
docker-compose ps  # Vérifier tous services up
docker-compose logs -f backend
```

**Vérifications:**
- [ ] MongoDB persistance → `docker-compose restart` ne perd pas données
- [ ] Frontend accessible → http://localhost
- [ ] Backend API → http://localhost:5000/api/health
- [ ] Nginx logs → requêtes proxy correctement
- [ ] Volumes MongoDB → `docker volume ls` montre mongo-data

---

### Tests VPS Déploiement

**Après déploiement sur VPS OVH:**
- [ ] DNS configuré (A records pour domaine et api.*)
- [ ] SSL actif → https://vitaflow.votredomaine.com
- [ ] API accessible → https://api.votredomaine.com/health
- [ ] Certificat Let's Encrypt valide (cadenas navigateur)
- [ ] APK se connecte à API production
- [ ] Tests charge → 50 users simultanés (k6, Apache Bench)
- [ ] Monitoring → `htop`, `docker stats`
- [ ] Logs centralisés → `docker-compose logs`
- [ ] Backup MongoDB fonctionne → script cron

---

## Décisions Techniques

### Décisions Architecturales

**1. Backend/Frontend Séparé vs Next.js Monolithe**
- **Choix:** Architecture séparée (Express + React)
- **Raisons:**
  - Même API pour web et mobile
  - Scaling indépendant (backend ≠ frontend)
  - Capacitor exige frontend statique (pas d'API routes Next.js)
  - Deployment flexibility (backend scaling vertical, frontend CDN)
- **Trade-offs:** Complexité déploiement accrue, mais gagnée en flexibilité

---

**2. React + Vite vs Next.js pour Frontend**
- **Choix:** React + Vite
- **Raisons:**
  - Build statique simple pour Capacitor
  - Pas besoin SSR (app authentifiée)
  - Vite dev experience ultra-rapide (HMR instantané)
  - Bundle size optimisé
- **Trade-offs:** Pas de SEO natif, mais non critique pour app privée

---

**3. MongoDB + Mongoose vs PostgreSQL + Prisma**
- **Choix:** MongoDB + Mongoose
- **Raisons:**
  - Flexibilité schema documents médicaux (évolution rapide)
  - Embedded soins dans patient (performance, pas de joins)
  - Requêtes préférentielles (exigence utilisateur)
  - Aggregation pipeline puissante pour stats
- **Trade-offs:** Pas de transactions multi-documents (acceptable ici)

---

**4. JWT Tokens vs Sessions Redis**
- **Choix:** JWT avec refresh tokens
- **Raisons:**
  - Stateless API (horizontal scaling facile)
  - Compatible mobile natif (pas de cookies)
  - Refresh tokens pour sécurité (invalidation possible)
  - Pas besoin Redis infrastructure
- **Trade-offs:** Tokens plus longs à invalider, mitigé par refresh strategy

---

**5. Zustand vs Redux vs Context API**
- **Choix:** Zustand pour auth, React Query pour data
- **Raisons:**
  - Zustand léger (1KB), moins boilerplate que Redux
  - Persist middleware simple (localStorage)
  - React Query gère cache/sync API (pas besoin Redux pour ça)
- **Trade-offs:** Moins d'outillage DevTools que Redux (acceptable)

---

**6. Capacitor vs React Native vs Flutter**
- **Choix:** Capacitor
- **Raisons:**
  - Réutilisation code web 100% (pas de réécriture)
  - Maintenance simplifiée (un seul codebase)
  - Accès plugins natifs si besoin futur
  - Team web-first (pas besoin apprendre React Native)
- **Trade-offs:** Performance légèrement inférieure app native, mais suffisante

---

**7. shadcn/ui vs Material-UI vs Ant Design**
- **Choix:** shadcn/ui + Tailwind
- **Raisons:**
  - Components source dans projet (ownership, customisation totale)
  - Accessible par défaut (WCAG)
  - Pas de bundle overhead (copié uniquement ce qui est utilisé)
  - Design moderne et professionnel
- **Trade-offs:** Moins de composants prêts qu'Ant Design, mais qualité supérieure

---

**8. Auto-increment ID Patient via Counter vs ObjectId**
- **Choix:** Auto-increment avec collection counters
- **Raisons:**
  - **Exigence métier critique:** IDs séquentiels non réattribués
  - Lisibilité humaine (patient #42 vs 507f1f77bcf86cd799439011)
  - Tri naturel chronologique
- **Implémentation:** findOneAndUpdate atomique (thread-safe)
- **Trade-offs:** Complexité accrue, mais requirement essentiel

---

**9. Embedded Soins vs Collection Séparée**
- **Choix:** Embedded array dans document Patient
- **Raisons:**
  - Performance: 1 query au lieu de 2 (patient + join soins)
  - Cohérence atomique (update patient.soins atomique)
  - Historique toujours lié au patient
  - Pas besoin queries complexes cross-collections
- **Limites:** Document max 16MB MongoDB, mais historique patient rarement > 1000 soins

---

**10. Soft Delete RDV vs Hard Delete**
- **Choix:** Soft delete (statut 'annule')
- **Raisons:**
  - Audit trail réglementaire (données médicales)
  - Statistiques historiques (revenu perdu, taux annulation)
  - Restauration possible si erreur
- **Trade-offs:** Queries doivent filtrer statuts annulés

---

**11. Docker Compose vs Kubernetes**
- **Choix:** Docker Compose
- **Raisons:**
  - VPS unique OVH (pas besoin orchestration cluster)
  - Simplicité opérationnelle (moins de courbe apprentissage)
  - Coût réduit (pas besoin k8s master nodes)
  - Suffisant pour traffic prévu (< 100 users concurrent)
- **Migration path:** Si scale nécessaire, migration k8s possible

---

**12. Nginx vs Traefik vs Caddy**
- **Choix:** Nginx + Certbot
- **Raisons:**
  - Familiarité équipe
  - Documentation exhaustive
  - Performance prouvée (reverse proxy, load balancing)
  - Let's Encrypt via Certbot (simple, gratuit)
- **Trade-offs:** Config manuelle vs auto-discovery Traefik, mais plus de contrôle

---

### Sécurité Décisions

**Password Hashing:** bcrypt rounds=12 (équilibre sécurité/performance)  
**JWT Expiry:** Access 7j (confort UX), Refresh 30j (rotation régulière)  
**Rate Limiting:** 100 req/15min global, 5 tentatives login/15min  
**CORS:** Whitelist strict origins (pas de wildcard)  
**Input Validation:** Zod schemas côté client ET serveur (defense in depth)  
**MongoDB:** Sanitization injection NoSQL, indexes sensibles  
**HTTPS:** Obligatoire production, HSTS headers, SSL/TLS 1.3  

---

### Performance Décisions

**Indexes MongoDB:**
- `patients`: `{ id: 1 }`, `{ nom: 1, prenom: 1 }`, `{ nom: 'text', prenom: 'text' }`
- `rendezvous`: `{ date: 1, medecinId: 1 }`, `{ patientId: 1, date: -1 }`
- `users`: `{ email: 1 }`, `{ role: 1 }`

**React Query:** Cache 5min, stale-while-revalidate, refetch on focus  
**Pagination:** Limit 20 items par défaut, cursor-based si > 10k patients  
**Image Optimization:** WebP format, lazy loading, responsive sizes  
**Bundle Splitting:** React Router lazy imports pages  

---

## Prochaines Étapes: Implémentation

### Ordre Recommandé

1. **Backend d'abord** (Steps 1-17): API fonctionnelle testable avec Postman
2. **Frontend Auth** (Steps 18-25): Login et navigation de base
3. **Frontend Patients** (Steps 29-34): Feature complète bout-en-bout
4. **Backend/Frontend parallèle** pour RDV et Dashboard
5. **Mobile** (Steps 49-57): Une fois web stable
6. **Docker et déploiement** (Steps 69-75): Après tests locaux complets

### Commandes Utiles

```bash
# Backend dev
cd backend && npm run dev

# Frontend dev
cd frontend && npm run dev

# Tests
npm test

# Build production
npm run build

# Docker local
docker-compose up --build

# Logs
docker-compose logs -f

# Seed admin initial
npm run seed

# Backup MongoDB
./scripts/backup.sh

# Restore MongoDB
./scripts/restore.sh 20260226_020000
```

---

## Ressources et Documentation

**Backend:**
- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/

**Frontend:**
- React: https://react.dev/
- Vite: https://vitejs.dev/
- shadcn/ui: https://ui.shadcn.com/
- React Query: https://tanstack.com/query/latest
- FullCalendar: https://fullcalendar.io/

**Mobile:**
- Capacitor: https://capacitorjs.com/
- Android Studio: https://developer.android.com/studio

**DevOps:**
- Docker: https://docs.docker.com/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/

---

**FIN DU PLAN - Prêt pour Implémentation IA**

Ce document contient toutes les spécifications, décisions, et étapes détaillées pour implémenter VitaFlow. Chaque phase peut être exécutée séquentiellement avec code complet fourni pour les parties critiques.
