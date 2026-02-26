# VitaFlow Backend

Backend API REST pour l'application de gestion de cabinet médical VitaFlow.

## 🚀 Quick Start

```bash
# Installer les dépendances
npm install

# Créer admin initial
npm run seed

# Lancer en développement
npm run dev

# Build pour production
npm run build && npm start
```

## 📋 Configuration

Copier `.env.example` vers `.env` et configurer:

```env
PORT=3001
MONGODB_URI=mongodb://root:password@localhost:27017
MONGODB_DB_NAME=vitaflow
JWT_SECRET=your_secret_here
```

## 🔑 Admin par défaut

Après `npm run seed`:
- **Email:** admin@vitaflow.com
- **Password:** Admin123!

## 📚 Modèles de Données

- **User** - Utilisateurs avec auth (admin, médecin, assistant)
- **Patient** - Fiches patients avec ID auto-increment
- **RendezVous** - Gestion des rendez-vous 
- **Counter** - Auto-increment atomique pour IDs patients

## 🛠 Tech Stack

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt pour mots de passe

## 📡 API Endpoints

- `GET /` - Info API
- `GET /api/health` - Health check
- Plus à venir: auth, patients, rendez-vous, stats...

---

**Status:** Backend de base fonctionnel ✅
