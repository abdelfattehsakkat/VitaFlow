# VitaFlow Frontend

> Interface web moderne pour la gestion de cabinet médical

## 🚀 Stack Technique

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 3.4.0
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router
- **Icons**: Lucide React

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# Lancer le serveur de développement
npm run dev
```

## 🎨 Design System

**Documentation complète disponible dans [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)**

Ce projet suit une philosophie de design Apple-inspired avec :
- Glassmorphism (transparence + backdrop blur)
- Gradients subtils et ombres colorées
- Animations fluides et micro-interactions
- Typographie raffinée avec espacements généreux

### Composants Principaux
- Boutons avec gradients et hover lift effects
- Cartes avec glassmorphism (`bg-white/80 backdrop-blur-xl`)
- Formulaires avec focus rings subtils
- Tableaux interactifs avec hover states
- Navigation avec icons Lucide

📖 **Consultez [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) avant de créer de nouveaux composants UI.**

## 🏗️ Structure du Projet

```
src/
├── components/       # Composants réutilisables
├── pages/           # Pages de l'application
├── layouts/         # Layouts (DashboardLayout, etc.)
├── store/           # Zustand stores (auth, etc.)
├── lib/             # Utilities (api client, etc.)
├── types/           # Types TypeScript
├── config/          # Configuration (weather, etc.)
└── assets/          # Images, fonts, etc.
```

## 🔐 Variables d'Environnement

```env
# API OpenWeatherMap (optionnel)
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## 🎯 Fonctionnalités

- ✅ Authentification JWT (access + refresh tokens)
- ✅ Gestion des patients (CRUD complet)
- ✅ Historique des consultations
- ✅ Statistiques du cabinet
- ✅ Recherche intelligente (nom, prénom, téléphone, ID)
- ✅ Pagination côté serveur
- ✅ Widget météo en temps réel
- ✅ Interface responsive
- ✅ Design system cohérent

## 📱 Pages Principales

| Route | Description |
|-------|-------------|
| `/` | Page de connexion |
| `/dashboard` | Dashboard avec statistiques |
| `/dashboard/patients` | Liste des patients |
| `/dashboard/patients/:id` | Détails d'un patient |
| `/dashboard/appointments` | Gestion des rendez-vous |

## 🎨 Contribution UI/UX

Pour maintenir la cohérence visuelle :

1. **Lire** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) en entier
2. **Respecter** les patterns établis (boutons, cartes, formulaires)
3. **Utiliser** les classes Tailwind documentées
4. **Tester** l'harmonie avec les pages existantes
5. **Documenter** les nouveaux composants dans le design system

### Checklist Pull Request UI
- [ ] Composants utilisent `rounded-xl` ou `rounded-2xl` (pas `rounded-lg`)
- [ ] Glassmorphism appliqué : `bg-white/80 backdrop-blur-xl`
- [ ] Ombres colorées sur boutons : `shadow-lg shadow-blue-500/30`
- [ ] Transitions fluides : `transition-all duration-200`
- [ ] Icons Lucide (pas d'emojis)
- [ ] Espacements généreux (`space-y-8`, `px-6 py-3`)
- [ ] Focus states définis pour accessibilité
- [ ] Testé sur mobile et desktop

## 🐛 Debugging

### Port déjà utilisé
```bash
# Tuer le processus sur le port 5173
lsof -ti:5173 | xargs kill -9
```

### Cache Vite
```bash
# Nettoyer le cache
rm -rf node_modules/.vite
```

## 📄 Licence

Propriétaire - VitaFlow © 2026

---

**Pour toute question design/UI, consultez [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) ✨**
```
