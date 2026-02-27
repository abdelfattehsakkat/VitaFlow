# VitaFlow Design System

> Guide de conception UI/UX pour le développement cohérent de l'interface VitaFlow

## 🎨 Philosophie de Design

VitaFlow adopte une esthétique **Apple-inspired** avec les principes suivants :
- **Glassmorphism** : Transparence et flou d'arrière-plan pour la profondeur
- **Gradients subtils** : Dégradés doux plutôt que des couleurs plates
- **Interactions fluides** : Animations et transitions douces
- **Espacement généreux** : Respiration visuelle pour une interface aérée
- **Typographie raffinée** : Hiérarchie claire avec `font-semibold` et `tracking-tight`

---

## 🎨 Palette de Couleurs

### Couleurs Principales
```css
/* Bleu Principal (Navigation, CTA) */
from-blue-500 to-blue-600
shadow-blue-500/30

/* Slate (Sidebar) */
from-slate-900 via-slate-800 to-slate-900

/* Gris Subtils (Backgrounds) */
bg-gray-50    /* Page background */
bg-gray-100   /* Section alternée */
border-gray-200/60    /* Bordures subtiles */
```

### Couleurs Sémantiques
```css
/* Succès / Positif */
text-green-500, text-green-600, bg-green-50

/* Danger / Négatif */
text-red-500, text-red-600, bg-red-50

/* Information */
text-blue-600, bg-blue-50

/* Neutre */
text-gray-500, text-gray-600, text-gray-900
```

### Gradients Diversifiés (Dashboard Cards)
```css
/* 6 gradients distincts pour éviter la monotonie */
from-cyan-50 to-cyan-100
from-violet-50 to-violet-100
from-emerald-50 to-emerald-100
from-indigo-50 to-indigo-100
from-amber-50 to-amber-100
from-rose-50 to-rose-100
```

---

## 📐 Composants de Base

### Boutons

#### Bouton Principal (Gradient)
```tsx
<button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 font-medium">
  <Icon className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
  Texte du bouton
</button>
```

**Caractéristiques :**
- Gradient : `from-blue-500 to-blue-600`
- Shadow colorée : `shadow-lg shadow-blue-500/30`
- Hover lift : `hover:-translate-y-0.5`
- Icon rotation : `group-hover:rotate-90` (ou `rotate-12` selon contexte)
- Coins arrondis : `rounded-xl` (pas `rounded-lg`)
- Padding : `px-6 py-3` (généreux)

#### Bouton Secondaire
```tsx
<button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-150 disabled:opacity-50 font-medium">
  Annuler
</button>
```

#### Bouton d'Action (Table)
```tsx
<button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg hover:scale-105 transition-all duration-150">
  <Edit2 className="w-4 h-4" />
</button>
```

### Cartes (Cards)

#### Carte Glassmorphism
```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-8">
  {/* Contenu */}
</div>
```

**Points clés :**
- Background semi-transparent : `bg-white/80`
- Backdrop blur : `backdrop-blur-xl`
- Bordures subtiles : `border-gray-200/60`
- Coins très arrondis : `rounded-2xl` (pas `rounded-lg`)
- Padding généreux : `p-8` ou `p-6`

#### Carte Statistique (Dashboard)
```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
  <p className="text-sm font-medium text-gray-500">Label</p>
  <p className="text-3xl font-bold text-gray-900 mt-2">Valeur</p>
</div>
```

**Ajouts :**
- Hover scale : `hover:scale-105`
- Hover shadow : `hover:shadow-lg`

### Formulaires

#### Input / Textarea
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
/>
```

**Caractéristiques :**
- Padding : `px-4 py-3` (pas `px-3 py-2`)
- Focus ring subtil : `focus:ring-2 focus:ring-blue-500/20`
- Coins arrondis : `rounded-xl`
- Résistance au resize pour textarea : `resize-none`

#### Label
```tsx
<label className="block text-sm font-semibold text-gray-700 mb-2">
  Nom du champ *
</label>
```

**Points clés :**
- Font weight : `font-semibold` (pas `font-medium`)
- Margin bottom : `mb-2` (espace généreux)

#### Section de Formulaire
```tsx
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-5">Section Title</h3>
  {/* Champs */}
</div>
```

### Tableaux

#### Container
```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200/60">
    {/* ... */}
  </table>
</div>
```

#### Header
```tsx
<thead className="bg-gray-50/50">
  <tr>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      Colonne
    </th>
  </tr>
</thead>
```

#### Rows
```tsx
<tbody className="bg-white divide-y divide-gray-200/60">
  <tr className="hover:bg-gray-50/50 transition-colors duration-150 group cursor-pointer">
    <td className="px-6 py-4 whitespace-nowrap">
      {/* Contenu */}
    </td>
  </tr>
</tbody>
```

**Interactions :**
- Hover background : `hover:bg-gray-50/50` (subtil)
- Group pour interactions imbriquées
- Cursor pointer si clickable

### Recherche

```tsx
<input
  type="text"
  placeholder="Rechercher..."
  className="w-full px-4 py-3 pl-10 bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
/>
```

**Spécifique :**
- Background clair : `bg-gray-50/80`
- Backdrop blur : `backdrop-blur-xl`
- Icon padding : `pl-10` (pour l'icône de recherche)
- Coins très arrondis : `rounded-2xl`

---

## ✨ Animations et Transitions

### Transitions Standards
```css
transition-all duration-200    /* Boutons, cartes */
transition-colors duration-150  /* Backgrounds, texte */
transition-transform duration-200  /* Icons, micro-animations */
```

### Hover Effects

#### Lift Effect (Boutons principaux)
```css
hover:-translate-y-0.5
```

#### Scale (Cartes, boutons d'action)
```css
hover:scale-105
```

#### Translation horizontale (Bouton retour)
```css
group-hover:-translate-x-1
```

#### Icon Rotation
```css
/* Rotation +90° (icône Plus) */
group-hover:rotate-90

/* Rotation +12° (icône Edit) */
group-hover:rotate-12

/* Scale */
group-hover:scale-110
```

### Shadows Dynamiques
```css
/* Base */
shadow-lg shadow-blue-500/30

/* Hover */
hover:shadow-xl hover:shadow-blue-500/40
```

### Opacity Reveal (Actions cachées)
```css
/* Parent */
group

/* Enfant */
opacity-0 group-hover:opacity-100 transition-opacity duration-150
```

---

## 📏 Espacements et Layout

### Spacing Scale
```css
/* Petits espacements */
gap-2, gap-3    /* Entre éléments inline */
space-y-2      /* Listes compactes */

/* Moyens */
gap-4, gap-6    /* Grids, flex containers */
space-y-4      /* Sections de contenu */

/* Généreux (préféré pour VitaFlow) */
gap-6, gap-8
space-y-6, space-y-8    /* Entre sections majeures */

/* Padding */
p-2       /* Boutons d'action */
p-4       /* Containers moyens */
p-6       /* Cartes standards */
p-8       /* Cartes importantes */
px-4 py-3  /* Inputs */
px-6 py-3  /* Boutons principaux */
```

### Coins Arrondis (Border Radius)
```css
rounded-lg    /* Boutons secondaires, petits éléments */
rounded-xl    /* Boutons principaux, inputs, cartes moyennes */
rounded-2xl   /* Cartes importantes, containers principaux */
rounded-full  /* Badges, avatars circulaires */
```

**Règle générale :** Privilégier `rounded-xl` et `rounded-2xl` pour VitaFlow.

---

## 🔤 Typographie

### Hiérarchie
```tsx
/* Page Title */
<h1 className="text-4xl font-semibold tracking-tight text-gray-900">

/* Section Title */
<h2 className="text-xl font-semibold text-gray-900">

/* Card Subtitle / Form Section */
<h3 className="text-lg font-semibold text-gray-900">

/* Label */
<p className="text-sm font-medium text-gray-500">

/* Valeur importante */
<p className="text-3xl font-bold text-gray-900">

/* Body Text */
<p className="text-gray-600 leading-relaxed">
```

### Font Weights
- `font-semibold` : Titres, labels importants (**préféré**)
- `font-bold` : Valeurs numériques, emphasis fort
- `font-medium` : Boutons, body text important
- `font-normal` : Texte standard

### Tracking
```css
tracking-tight    /* Grands titres (text-4xl, text-3xl) */
tracking-normal   /* Texte standard (défaut) */
```

---

## 🎭 Patterns d'Interaction

### Navigation Links (Sidebar)
```tsx
<Link
  to="/path"
  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
    isActive
      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
  }`}
>
  <Icon className={`w-5 h-5 transition-transform duration-200 ${
    isActive ? '' : 'group-hover:scale-110'
  }`} />
  <span>Label</span>
</Link>
```

### Clickable Table Row
```tsx
<tr 
  onClick={handleClick}
  className="hover:bg-gray-50/50 transition-colors duration-150 group cursor-pointer"
>
  {/* Cellules */}
</tr>
```

### Badge / Tag
```tsx
<span className="px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200/60">
  {value}
</span>
```

### Consultation Badge (Valeurs monétaires)
```tsx
<span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg">
  {amount} TND
</span>
```

---

## 🖼️ Layout Patterns

### Page Wrapper
```tsx
<div className="space-y-8">
  {/* Sections */}
</div>
```

**Note :** `space-y-8` pour l'espacement entre sections majeures (pas `space-y-6`).

### Header avec Action
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Titre</h1>
    <p className="text-gray-500 mt-2">Description</p>
  </div>
  <button className="...">Action</button>
</div>
```

### Statistics Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

### Form Grid (2 colonnes)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Inputs */}
</div>
```

---

## 🎨 Composants Spécifiques VitaFlow

### Avatar Patient
```tsx
<div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
  <User className="w-12 h-12 text-blue-600" />
</div>
```

### Logo VitaFlow (Sidebar)
```tsx
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
  <span className="text-white font-bold text-xl">V</span>
</div>
```

### Sidebar User Card
```tsx
<div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
    <User className="w-5 h-5 text-white" />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-white truncate">
      {user.nom}
    </p>
    <p className="text-xs text-slate-400 capitalize">
      {user.role}
    </p>
  </div>
</div>
```

### Pagination
```tsx
<div className="flex items-center justify-between border-t border-gray-200/60 bg-gray-50/30 px-6 py-4 rounded-b-2xl">
  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:shadow-sm transition-all duration-150 disabled:opacity-50 font-medium">
    Précédent
  </button>
  
  <p className="text-sm text-gray-600 font-medium">
    Page {current} · {start}-{end} sur {total}
  </p>
  
  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:shadow-sm transition-all duration-150 disabled:opacity-50 font-medium">
    Suivant
  </button>
</div>
```

---

## 🚀 Best Practices

### DO ✅
- Utiliser `rounded-xl` et `rounded-2xl` (pas `rounded-lg` par défaut)
- Appliquer glassmorphism : `bg-white/80 backdrop-blur-xl`
- Ajouter des ombres colorées sur les CTA : `shadow-lg shadow-blue-500/30`
- Préférer `space-y-8` pour l'espacement principal
- Utiliser `font-semibold` pour les titres et labels
- Ajouter `transition-all duration-200` pour les interactions
- Inclure `group` et `group-hover:` pour les animations imbriquées
- Utiliser des bordures subtiles : `border-gray-200/60`
- Padding généreux : `px-6 py-3` pour boutons, `p-6` ou `p-8` pour cartes

### DON'T ❌
- Ne pas utiliser d'emojis dans les liens de navigation (utiliser Lucide icons)
- Éviter les couleurs trop saturées ou criardes
- Ne pas mélanger `rounded-lg` et `rounded-xl` dans le même contexte
- Éviter les animations trop rapides (< 150ms) ou trop lentes (> 300ms)
- Ne pas oublier les états `disabled:opacity-50` sur les boutons
- Éviter `bg-white` plat, préférer `bg-white/80 backdrop-blur-xl`
- Ne pas utiliser `px-4 py-2` pour les boutons principaux (trop petit)

---

## 📦 Icônes

### Bibliothèque : Lucide React
```bash
npm install lucide-react
```

### Icônes Principales
```tsx
import {
  LayoutDashboard,  // Dashboard
  Users,            // Patients
  Calendar,         // Rendez-vous
  User,             // Profil utilisateur
  Edit2,            // Modifier
  Trash2,           // Supprimer
  Plus,             // Ajouter
  Search,           // Rechercher
  Eye,              // Voir
  ArrowLeft,        // Retour
  LogOut,           // Déconnexion
  FileText,         // Documents
  Phone,            // Téléphone
  Mail,             // Email
  MapPin,           // Adresse
} from 'lucide-react'
```

### Tailles Recommandées
```tsx
w-4 h-4   /* Boutons, inline icons */
w-5 h-5   /* Navigation, actions standard */
w-6 h-6   /* Headers, emphasis */
w-12 h-12 /* Avatars, grandes icônes */
```

---

## 🌈 Exemples Complets

### Formulaire Modal
```tsx
<div className="max-w-2xl">
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60">
    <div className="px-6 py-5 border-b border-gray-200/60 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900">Titre du formulaire</h2>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-150"
      >
        ✕
      </button>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Champ *
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/60">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-150 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 font-medium"
        >
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</div>
```

### Stats Card avec Hover
```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
  <p className="text-sm font-medium text-gray-500">Label</p>
  <p className="text-3xl font-bold text-blue-600 mt-2">
    {value.toLocaleString()}
  </p>
</div>
```

---

## 🔄 Mise à Jour Continue

Ce design system évolue avec VitaFlow. Pour toute nouvelle fonctionnalité :

1. **Respecter les patterns établis** avant d'innover
2. **Tester l'harmonie visuelle** avec les pages existantes
3. **Documenter** les nouveaux composants ici
4. **Privilégier la cohérence** à l'originalité

---

## 📞 Contact

Pour questions ou suggestions :
- Créer une issue GitHub avec le tag `design`
- Référencer ce document dans vos Pull Requests UI

**Version:** 1.0  
**Dernière mise à jour:** Février 2026
