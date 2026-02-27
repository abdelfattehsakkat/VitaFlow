# Guide de Contribution UI/UX

> Guidelines rapides pour contribuer au design de VitaFlow

## 📚 Documentation Complète

**Avant toute contribution, lisez le [Design System complet](../frontend/DESIGN_SYSTEM.md)** qui contient tous les patterns, composants et exemples de code.

## 🎯 Principes de Base

### 1. Cohérence Avant Tout
VitaFlow utilise un design Apple-inspired. Tous les nouveaux composants doivent s'intégrer harmonieusement avec l'existant.

### 2. Glassmorphism
```tsx
// ✅ BON
<div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60">

// ❌ MAUVAIS
<div className="bg-white rounded-lg border border-gray-300">
```

### 3. Boutons avec Gradients
```tsx
// ✅ BON - Bouton principal
<button className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">

// ❌ MAUVAIS
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
```

### 4. Espacements Généreux
```tsx
// ✅ BON
<div className="space-y-8 p-8">
  
// ❌ MAUVAIS
<div className="space-y-4 p-4">
```

### 5. Icons = Lucide React
```tsx
// ✅ BON
import { Users } from 'lucide-react'
<Users className="w-5 h-5" />

// ❌ MAUVAIS
<span>👥</span>
```

## ✅ Checklist PR

Avant de soumettre un Pull Request UI :

### Design
- [ ] J'ai lu [DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md) en entier
- [ ] Les composants utilisent `rounded-xl` ou `rounded-2xl`
- [ ] Glassmorphism appliqué (`bg-white/80 backdrop-blur-xl`)
- [ ] Ombres colorées sur boutons principaux (`shadow-lg shadow-blue-500/30`)
- [ ] Transitions fluides (`transition-all duration-200`)
- [ ] Icons Lucide (pas d'emojis)
- [ ] Espacements généreux (`px-6 py-3`, `space-y-8`)

### Accessibilité
- [ ] Focus states visibles (`focus:ring-2 focus:ring-blue-500/20`)
- [ ] Contraste suffisant (WCAG AA minimum)
- [ ] Labels présents sur tous les inputs
- [ ] Boutons avec `disabled:opacity-50`

### Responsive
- [ ] Testé sur mobile (< 768px)
- [ ] Testé sur tablette (768px - 1024px)
- [ ] Testé sur desktop (> 1024px)

### Code
- [ ] Pas d'erreurs TypeScript
- [ ] Classes Tailwind ordonnées logiquement
- [ ] Composants réutilisables extraits si nécessaire
- [ ] Pas de duplication de styles

## 🎨 Composants à Réutiliser

Avant de créer un nouveau composant, vérifier si ces patterns existent :

| Composant | Fichier | Usage |
|-----------|---------|-------|
| **Page Header Premium** | `PatientsPage.tsx` | **En-tête avec badge icône + compteur + quick stats** |
| Bouton Gradient | `DashboardPage.tsx`, `PatientsPage.tsx` | CTA principaux |
| Carte Stats | `DashboardPage.tsx` | Statistiques |
| Table Interactive | `PatientsPage.tsx` | Listes de données |
| Formulaire Modal | `PatientDetailsPage.tsx` | Création/édition |
| Sidebar Navigation | `DashboardLayout.tsx` | Menu principal |
| Search Bar | `PatientsPage.tsx` | Recherche avec icône |

## 🔍 Exemples Rapides

### Bouton Principal avec Icône
```tsx
<button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 font-medium">
  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
  Nouveau Patient
</button>
```

### Card avec Hover Effect
```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200">
  <p className="text-sm font-medium text-gray-500">Total Patients</p>
  <p className="text-3xl font-bold text-gray-900 mt-2">200</p>
</div>
```

### Input avec Focus Ring
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
/>
```

### Page Header Premium (Nouveau Pattern)
```tsx
<div className="flex items-start gap-6">
  {/* Badge icône 16x16 */}
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
    <Users className="w-8 h-8 text-white" />
  </div>
  
  <div className="space-y-2">
    <div className="flex items-center gap-4">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Patients</h1>
      {/* Badge compteur dynamique */}
      <span className="px-4 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200/60 shadow-sm">
        200 patients
      </span>
    </div>
    <p className="text-base text-gray-500 max-w-2xl">
      Gérez les dossiers médicaux, consultations et historique de vos patients
    </p>
    
    {/* Quick stats avec indicateur animé */}
    <div className="flex items-center gap-6 pt-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="font-medium">10</span>
        <span className="text-gray-400">sur cette page</span>
      </div>
    </div>
  </div>
</div>
```
**Voir documentation complète dans [DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md#page-header-premium-nouveau-pattern)**

## 🚫 Anti-Patterns

### À Éviter Absolument

```tsx
// ❌ Emojis dans la navigation
<Link to="/dashboard">📊 Dashboard</Link>

// ❌ Couleurs plates sans gradient sur CTA
<button className="bg-blue-600 text-white px-4 py-2 rounded">OK</button>

// ❌ Coins carrés ou peu arrondis
<div className="rounded border">Content</div>

// ❌ Pas de transparence sur les cartes principales
<div className="bg-white rounded-lg">Card</div>

// ❌ Animations trop rapides
<button className="transition-all duration-50">Too fast</button>

// ❌ Padding insuffisant
<button className="px-2 py-1">Too tight</button>
```

## 🎓 Ressources

- **Design System complet** : [`frontend/DESIGN_SYSTEM.md`](../frontend/DESIGN_SYSTEM.md)
- **Tailwind CSS Docs** : https://tailwindcss.com/docs
- **Lucide Icons** : https://lucide.dev/icons
- **Apple HIG** : https://developer.apple.com/design/human-interface-guidelines

## 📸 Screenshot Policy

Lors de votre PR, incluez des screenshots montrant :
1. État normal
2. État hover
3. Vue mobile (si applicable)
4. État de focus (formulaires)

## 💬 Questions ?

- **Design questions** : Créer une issue avec le tag `design`
- **Bugs UI** : Tag `bug` + `UI`
- **Nouvelles features UI** : Tag `enhancement` + `UI`

---

**Merci de contribuer à VitaFlow avec soin et attention au détail ! 🎨✨**
