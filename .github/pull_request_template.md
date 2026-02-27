## 📝 Description

<!-- Décrivez brièvement les changements apportés -->

## 🎯 Type de Changement

- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 🎨 Changement UI/UX
- [ ] ♻️ Refactoring
- [ ] 📝 Documentation
- [ ] 🔧 Configuration
- [ ] ✅ Tests

## 🎨 Checklist UI/UX (si applicable)

**Si votre PR modifie l'interface, cochez tous les éléments applicables :**

### Design System
- [ ] J'ai lu [`DESIGN_SYSTEM.md`](../frontend/DESIGN_SYSTEM.md)
- [ ] Utilisation de `rounded-xl` ou `rounded-2xl` (pas `rounded-lg`)
- [ ] Glassmorphism appliqué : `bg-white/80 backdrop-blur-xl`
- [ ] Ombres colorées sur boutons : `shadow-lg shadow-blue-500/30`
- [ ] Transitions fluides : `transition-all duration-200`
- [ ] Icons Lucide React (pas d'emojis)
- [ ] Espacements généreux (`px-6 py-3`, `space-y-8`)

### Accessibilité
- [ ] Focus states définis (`focus:ring-2 focus:ring-blue-500/20`)
- [ ] Contraste WCAG AA minimum
- [ ] Labels présents sur tous les inputs
- [ ] États disabled avec `disabled:opacity-50`

### Responsive
- [ ] Testé sur mobile (< 768px)
- [ ] Testé sur tablette (768px - 1024px)
- [ ] Testé sur desktop (> 1024px)

### Code Quality
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs de lint
- [ ] Classes Tailwind ordonnées logiquement
- [ ] Composants réutilisables extraits si nécessaire

## 🖼️ Screenshots

<!-- Ajouter des captures d'écran pour les changements UI -->
<!-- Inclure : état normal, hover, mobile si applicable -->

### Avant
<!-- Screenshot de l'état avant les changements -->

### Après
<!-- Screenshot de l'état après les changements -->

## 🧪 Tests

- [ ] Tests manuels effectués
- [ ] Navigation testée (routes, liens)
- [ ] Formulaires validés
- [ ] États d'erreur vérifiés

## 📋 Checklist Générale

- [ ] Le code compile sans erreurs
- [ ] Les modifications fonctionnent comme prévu
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les logs de debug sont supprimés
- [ ] Le code respecte les conventions du projet

## 🔗 Issues Liées

<!-- Référence aux issues GitHub (ex: Closes #123) -->

## 📝 Notes Supplémentaires

<!-- Toute information complémentaire pour les reviewers -->

---

**Merci pour votre contribution ! 🚀**
