# Page de Gestion des Patients - Documentation

## Vue d'ensemble

La page de gestion des patients permet de gérer l'ensemble du cycle de vie des dossiers patients avec:
- Liste paginée et recherche en temps réel
- Formulaires d'ajout/modification de patients
- Vue détaillée avec historique des consultations
- Gestion complète des consultations (ajout, modification, suppression)

## Structure des Fichiers

### 1. Types TypeScript (`src/types/index.ts`)
```typescript
interface Patient {
  _id: string
  numeroPatient: string        // Ex: P000001 (auto-généré)
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email?: string
  adresse?: string
  mutuelle?: string
  numeroMutuelle?: string
  antecedents?: string
  soins: Soin[]               // Historique consultations
  totalHonoraires?: number    // Virtuel: somme des honoraires
  totalRecu?: number          // Virtuel: somme des montants reçus
}

interface Soin {
  date: string
  titre: string
  description?: string
  honoraire: number
  recu: number                // Montant effectivement payé
  medecin?: string
  medecinNom?: string
}
```

### 2. Page Liste Patients (`src/pages/PatientsPage.tsx`)

#### Fonctionnalités
- **Table avec colonnes**: N° Patient, Nom & Prénom, Âge, Téléphone, Nb Consultations, Total Reçu
- **Recherche en temps réel**: Par nom, prénom, téléphone ou numéro patient
- **Pagination**: 10 patients par page avec navigation précédent/suivant
- **Actions**: 
  - 👁️ Voir détails (navigation vers page détails)
  - ✏️ Modifier (ouvre formulaire en mode édition)
  - 🗑️ Supprimer (avec confirmation)
- **Bouton "Nouveau Patient"**: Ouvre formulaire de création

#### API Utilisées
```typescript
GET /api/patients?page=1&limit=10&search=...
DELETE /api/patients/:id
```

#### Composant PatientForm
Formulaire réutilisable pour création/modification:
- **Champs obligatoires** (avec `*`): Nom, Prénom, Date de Naissance, Téléphone
- **Champs optionnels**: Email, Adresse, Mutuelle, Numéro Mutuelle, Antécédents médicaux
- **Validation**: HTML5 native (required, type="email", type="tel", type="date")
- **Gestion d'erreurs**: Affiche message d'erreur en cas d'échec
- **États**: Loading pendant l'envoi, boutons désactivés

#### API Utilisées
```typescript
POST /api/patients         // Création
PUT /api/patients/:id      // Modification
```

### 3. Page Détails Patient (`src/pages/PatientDetailsPage.tsx`)

#### Sections

##### A. Fiche Patient
- Avatar avec initiales
- Nom complet + Numéro patient (badge)
- Informations de contact (téléphone, email, adresse)
- Date de naissance avec calcul d'âge automatique
- Mutuelle avec numéro d'adhérent
- Antécédents médicaux (si présents)

##### B. Cartes Statistiques
Trois cartes affichant:
1. **Total Consultations**: Nombre de consultations dans l'historique
2. **Total Honoraires**: Somme des honoraires facturés (bleu)
3. **Total Reçu**: Somme des montants effectivement perçus (vert)

##### C. Historique des Consultations
- **Tri chronologique**: Du plus récent au plus ancien
- **Affichage par consultation**:
  - Titre et date
  - Description (facultative)
  - Honoraire facturé
  - Montant reçu (en vert)
  - Nom du médecin (si renseigné)
- **Actions par consultation**:
  - ✏️ Modifier
  - 🗑️ Supprimer (avec confirmation)
- **Bouton "Nouvelle Consultation"**: Ouvre formulaire

#### Composant SoinForm
Formulaire d'ajout/modification de consultation:
- **Date** (type="date", par défaut: aujourd'hui)
- **Titre** (ex: "Consultation générale")
- **Description** (textarea, facultatif)
- **Honoraire** (number, requis, TND)
- **Montant Reçu** (number, requis, TND)

#### API Utilisées
```typescript
GET /api/patients/:id                    // Récupérer détails patient
POST /api/patients/:id/soins             // Ajouter consultation
PUT /api/patients/:id/soins/:date        // Modifier consultation
DELETE /api/patients/:id/soins/:date     // Supprimer consultation
```

### 4. Routes (`src/App.tsx`)

```typescript
/dashboard/patients              // Liste des patients
/dashboard/patients/:id          // Détails d'un patient
```

## Flux Utilisateur

### Création Patient
1. Clic "Nouveau Patient" → Affiche formulaire vide
2. Remplir champs obligatoires (nom, prénom, date naissance, téléphone)
3. Optionnel: Email, adresse, mutuelle, antécédents
4. Submit → POST `/api/patients`
5. Succès → Retour liste + invalidation cache React Query
6. Échec → Message d'erreur affiché

### Modification Patient
1. Clic icône ✏️ dans liste → Formulaire pré-rempli
2. Modifier champs
3. Submit → PUT `/api/patients/:id`
4. Succès → Retour liste + invalidation cache
5. Échec → Message d'erreur

### Consultation Dossier Patient
1. Clic icône 👁️ dans liste → Navigation vers `/dashboard/patients/:id`
2. Affichage fiche complète + statistiques + historique
3. Possibilité d'ajouter/modifier/supprimer consultations

### Ajout Consultation
1. Dans page détails, clic "Nouvelle Consultation"
2. Formulaire avec date pré-remplie (aujourd'hui)
3. Remplir titre, honoraire, montant reçu
4. Submit → POST `/api/patients/:id/soins`
5. Succès → Fermeture formulaire + rechargement données patient

### Suppression Patient
1. Clic icône 🗑️ dans liste
2. Confirmation native browser: "Êtes-vous sûr..."
3. Si OK → DELETE `/api/patients/:id`
4. Succès → Liste actualisée

## Style et UX

### Palette de Couleurs
- **Primaire**: Bleu (#2563EB) - Actions principales
- **Succès**: Vert - Montants reçus
- **Danger**: Rouge - Suppressions
- **Neutre**: Gris - Informations secondaires

### Composants UI
- **Cartes**: `bg-white rounded-lg shadow-sm`
- **Boutons primaires**: `bg-blue-600 text-white hover:bg-blue-700`
- **Boutons secondaires**: `border border-gray-300 hover:bg-gray-50`
- **Inputs**: `border border-gray-300 focus:ring-2 focus:ring-blue-500`
- **Tables**: Hover effect sur lignes, colonnes alignées

### Icônes (Lucide React)
- `User`: Avatar patient
- `Plus`: Ajouter patient/consultation
- `Search`: Recherche
- `Edit2`: Modifier
- `Trash2`: Supprimer
- `Eye`: Voir détails
- `Phone`, `Mail`, `MapPin`, `Calendar`, `CreditCard`, `FileText`: Informations patient
- `ArrowLeft`: Retour

### États de Chargement
- **Loading initial**: "Chargement..." centré
- **Liste vide**: Message "Aucun patient enregistré"
- **Recherche sans résultats**: "Aucun patient trouvé pour cette recherche"
- **Boutons en cours**: "Enregistrement...", désactivés

## React Query

### Clés de Cache
```typescript
['patients', searchTerm, currentPage]  // Liste paginée
['patient', id]                         // Détails patient
```

### Invalidation
- Après création/modification/suppression patient → `invalidateQueries(['patients'])`
- Après ajout/modification/suppression consultation → `invalidateQueries(['patient', id])`

### Configuration
```typescript
{
  retry: 1,                          // 1 seule tentative en cas d'échec
  refetchOnWindowFocus: false        // Pas de refetch automatique
}
```

## Gestion d'Erreurs

### Erreurs API
- Catch dans mutation → `mutation.isError === true`
- Affichage: `<div className="bg-red-50 border border-red-200 text-red-700">`
- Message générique: "Une erreur est survenue. Veuillez réessayer."

### Erreurs de Validation
- Validation HTML5 (required, type, min, max)
- Browser affiche messages natifs avant submit

### Erreurs Réseau
- Intercepteur Axios gère 401 (token expiré) → auto-refresh ou redirect login
- Autres erreurs → Affichées dans composant

## Améliorations Futures

### Court Terme
- [ ] Toast notifications (react-hot-toast) au lieu d'alerts
- [ ] Confirmation modale stylisée pour suppressions
- [ ] Skeleton loaders pendant chargement
- [ ] Tri par colonnes (nom, date, montants)
- [ ] Filtres avancés (mutuelle, tranche d'âge)
- [ ] Export CSV/PDF de la liste

### Moyen Terme
- [ ] Vue calendrier des consultations par patient
- [ ] Gestion documents/images (ordonnances, radios)
- [ ] Statistiques patient (graphique évolution)
- [ ] Envoi SMS/Email rappels
- [ ] Impression fiche patient

### Long Terme
- [ ] Historique des modifications (audit log)
- [ ] Mode hors-ligne (PWA)
- [ ] Synchronisation multi-appareils
- [ ] Intégration avec API mutuelle (tiers-payant)

## Tests Suggérés

### Tests Manuels
1. ✅ Créer patient avec champs obligatoires uniquement
2. ✅ Créer patient avec tous les champs remplis
3. ✅ Modifier patient existant
4. ✅ Rechercher patient par nom/prénom/téléphone
5. ✅ Naviguer entre pages de pagination
6. ✅ Ajouter consultation à un patient
7. ✅ Modifier consultation existante
8. ✅ Supprimer consultation (annuler confirmation)
9. ✅ Supprimer consultation (confirmer)
10. ✅ Supprimer patient avec consultations

### Tests Automatisés (À implémenter)
```typescript
// Exemple avec Vitest + React Testing Library
describe('PatientsPage', () => {
  it('should display search results', async () => {
    // Mock API, render, wait, assert
  })
  
  it('should open form on "Nouveau Patient" click', () => {
    // ...
  })
})
```

## Dépendances Utilisées

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.1.3",
  "@tanstack/react-query": "^6.0.0",
  "zustand": "^5.0.3",
  "axios": "^1.8.0",
  "lucide-react": "^0.468.0",
  "tailwindcss": "^3.4.17"
}
```

## Performance

### Optimisations Implémentées
- **Pagination**: Limite à 10 résultats par page
- **Recherche debounced**: React Query gère automatiquement avec queryKey
- **Cache React Query**: Évite requêtes redondantes
- **Lazy Loading**: Routes chargées à la demande

### Métriques Attendues
- **First Paint**: < 1s (Vite HMR)
- **API Response**: < 200ms (MongoDB indexé sur numeroPatient, nom)
- **Pagination**: Instantanée (cache client)
- **Search**: < 300ms (avec debounce côté backend si implémté)

## Accessibilité

- Labels explicites pour tous les inputs
- Attributs `title` sur boutons icônes
- Contraste couleurs conforme WCAG AA
- Navigation clavier fonctionnelle
- Focus visible sur éléments interactifs

## Responsive Design

### Breakpoints
- **Mobile (<640px)**: Colonnes tableau empilées (overflow-x-auto)
- **Tablet (640-1024px)**: Grid 1 colonne pour formulaires
- **Desktop (>1024px)**: Grid 2 colonnes, table pleine largeur

### Mobile Optimizations
- Boutons tactiles (min 44x44px)
- Inputs avec type approprié (tel, email) → clavier mobile adapté
- Formulaires scrollables
- Navigation simplifiée

---

**Dernière mise à jour**: Phase 8 du développement VitaFlow
**Status**: ✅ Fonctionnel et testé
**Backend**: Compatible avec API REST existante (17 endpoints)
