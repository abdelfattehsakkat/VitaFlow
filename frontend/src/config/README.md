# Configuration Météo

## Configuration OpenWeatherMap

Le widget météo utilise l'API gratuite d'OpenWeatherMap pour afficher la météo en temps réel.

### Obtenir une clé API gratuite

1. Créez un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Inscrivez-vous gratuitement (Free Plan : 1000 appels/jour)
3. Après inscription, copiez votre clé API
4. À la racine du dossier `frontend/`, créez un fichier `.env.local` (ou copiez `.env.example`)
5. Ajoutez votre clé :
   ```
   VITE_OPENWEATHER_API_KEY=votre_cle_api_ici
   ```
6. Redémarrez le serveur Vite (`npm run dev`)

### Fichiers de configuration

- **`.env.example`** : Template à copier (commité dans git)
- **`.env.local`** : Votre configuration personnelle (ignoré par git ✅)
- **`src/config/weather.config.ts`** : Configuration de la ville et paramètres

Le fichier `.env.local` est automatiquement ignoré par git, votre clé API reste privée.

### Configuration

Dans `src/config/weather.config.ts`, vous pouvez configurer :

```typescript
{
  city: 'Tunis',           // Ville à afficher
  country: 'TN',           // Code pays (TN pour Tunisie)
  apiKey: 'VOTRE_CLE',     // Votre clé API OpenWeatherMap
  units: 'metric',         // metric (Celsius) ou imperial (Fahrenheit)
  lang: 'fr'               // Langue des descriptions météo
}
```

### Villes Tunisiennes disponibles

- Tunis
- Sfax
- Sousse
- Kairouan
- Bizerte
- Gabès
- Ariana
- Monastir
- Nabeul
- Ben Arous

### Fonctionnement

- La météo se rafraîchit automatiquement toutes les 30 minutes
- Si la clé API n'est pas configurée, un widget par défaut s'affiche
- Affiche : température actuelle, ressenti, description, vent et humidité
- Icônes dynamiques selon les conditions météo (soleil, nuages, pluie, etc.)

### Dépannage

Si la météo ne s'affiche pas :
1. Vérifiez que votre clé API est valide
2. Attendez quelques minutes après l'inscription (activation de la clé)
3. Vérifiez votre connexion internet
4. Consultez la console du navigateur pour les erreurs
