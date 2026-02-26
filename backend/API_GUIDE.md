# VitaFlow API - Guide d'Utilisation

## 🔗 Base URL
```
http://localhost:3001/api
```

## 🔐 Authentification

Toutes les routes (sauf `/auth/login` et `/auth/refresh`) nécessitent un token JWT dans le header:
```
Authorization: Bearer <access_token>
```

### Endpoints Auth

#### 1. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@vitaflow.com",
  "password": "Admin123!"
}

# Réponse
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "admin" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

#### 2. Get Current User
```bash
GET /auth/me
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "id": "...",
    "email": "admin@vitaflow.com",
    "nom": "Admin",
    "prenom": "VitaFlow",
    "role": "admin",
    "isActive": true
  }
}
```

#### 3. Register New User (Admin only)
```bash
POST /auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "medecin1@cabinet.com",
  "password": "Secure123!",
  "nom": "Benali",
  "prenom": "Karim",
  "role": "medecin"
}
```

#### 4. Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

#### 5. Logout
```bash
POST /auth/logout
Authorization: Bearer <token>
```

---

## 👥 Patients

### 1. Liste des Patients
```bash
GET /patients?page=1&limit=20&search=alaoui&sortBy=id
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": 1,
        "nom": "Alaoui",
        "prenom": "Mohammed",
        "telephone": "+212661234567",
        "adresse": "...",
        "totalHonoraires": 0,
        "derniereSoin": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Détails d'un Patient
```bash
GET /patients/:id
Authorization: Bearer <token>

# Réponse avec historique complet des soins
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Alaoui",
    "prenom": "Mohammed",
    "soins": [
      {
        "date": "2026-02-26T...",
        "description": "Consultation générale",
        "honoraire": 300,
        "recu": 250,
        "medecinNom": "Dr. Admin VitaFlow"
      }
    ],
    "totalHonoraires": 300,
    "totalRecu": 250,
    "derniereSoin": { ... }
  }
}
```

### 3. Créer un Patient
```bash
POST /patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Alaoui",
  "prenom": "Mohammed",
  "telephone": "+212661234567",
  "adresse": "123 Rue Hassan II, Casablanca"
}

# Réponse
{
  "success": true,
  "message": "Patient créé avec ID 1",
  "data": { ... }
}
```

### 4. Modifier un Patient
```bash
PATCH /patients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "telephone": "+212662222222",
  "adresse": "Nouvelle adresse"
}
```

### 5. Ajouter une Consultation
```bash
POST /patients/:id/soins
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Consultation + ordonnance",
  "honoraire": 300,
  "recu": 250,
  "medecinId": "69a0be6ebdc9fc37332592e8",
  "date": "2026-02-26"
}

# honoraire = montant facturé total
# recu = montant effectivement payé par le patient
# medecinNom sera auto-rempli
```

### 6. Supprimer un Patient
```bash
DELETE /patients/:id
Authorization: Bearer <token>
```

---

## 📅 Rendez-Vous

### 1. Liste des Rendez-Vous
```bash
# Filtrage flexible
GET /rendez-vous?date=2026-03-01
GET /rendez-vous?medecinId=...
GET /rendez-vous?patientId=...
GET /rendez-vous?statut=planifie
GET /rendez-vous?startDate=2026-03-01&endDate=2026-03-31

Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "rendezVous": [
      {
        "_id": "...",
        "patientId": { "nom": "Alaoui", "prenom": "Mohammed" },
        "patientNom": "Alaoui Mohammed",
        "medecinId": { "nom": "Admin", "prenom": "VitaFlow" },
        "medecinNom": "Dr. Admin VitaFlow",
        "date": "2026-03-01T00:00:00.000Z",
        "heureDebut": "09:00",
        "heureFin": "09:30",
        "statut": "planifie",
        "motif": "Consultation de suivi"
      }
    ],
    "pagination": { ... }
  }
}
```

### 2. Créer un Rendez-Vous
```bash
POST /rendez-vous
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "69a0bff2421df742295e89d9",
  "medecinId": "69a0be6ebdc9fc37332592e8",
  "date": "2026-03-01",
  "heureDebut": "09:00",
  "heureFin": "09:30",
  "motif": "Consultation de suivi",
  "notes": "Patient régulier"
}

# Validation automatique :
# - Durée entre 15min et 3h
# - Aucun chevauchement avec autre RDV du même médecin
# - patientNom et medecinNom auto-remplis

# Réponse si succès
{
  "success": true,
  "message": "Rendez-vous créé",
  "data": { ... }
}

# Réponse si chevauchement
{
  "success": false,
  "message": "Ce créneau est déjà occupé",
  "data": { ... RDV existant ... }
}
```

### 3. Modifier un Rendez-Vous
```bash
PATCH /rendez-vous/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "statut": "confirme",
  "notes": "Patient a confirmé"
}

# Peut aussi modifier date, heureDebut, heureFin
# La validation de chevauchement sera re-exécutée
```

### 4. Annuler/Supprimer un Rendez-Vous
```bash
# Soft delete (statut = annulé)
DELETE /rendez-vous/:id
Authorization: Bearer <token>

# Hard delete (suppression définitive)
DELETE /rendez-vous/:id?hard=true
Authorization: Bearer <token>
```

---

## 📊 Statistiques

### 1. Vue d'Ensemble Dashboard
```bash
GET /stats/overview
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "totalPatients": 2,
    "totalMedecins": 1,
    "rendezVousToday": 0,
    "rendezVousMonth": 0,
    "patientsThisMonth": 2,
    "revenueMonth": 300
  }
}
```

### 2. Statistiques de Revenus
```bash
GET /stats/revenue?startDate=2026-01-01&endDate=2026-12-31&medecinId=...
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "revenueByMonth": [
      { "month": "2026-02", "total": 300 },
      { "month": "2026-03", "total": 1500 }
    ],
    "revenueByMedecin": [
      {
        "medecinId": "...",
        "medecinNom": "Dr. Admin VitaFlow",
        "total": 1800
      }
    ]
  }
}
```

### 3. Top Patients par Revenus
```bash
GET /stats/top-patients?limit=10
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Alaoui",
      "prenom": "Mohammed",
      "telephone": "+212661234567",
      "totalHonoraires": 300,
      "nombreSoins": 1
    }
  ]
}
```

### 4. Statistiques Rendez-Vous
```bash
GET /stats/appointments?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "data": {
    "total": 2,
    "byStatus": {
      "planifie": 1,
      "confirme": 1,
      "termine": 0,
      "annule": 0
    },
    "byMedecin": [
      {
        "medecinId": "69a0be6ebdc9fc37332592e8",
        "count": 2
      }
    ]
  }
}
```

---

## 🔒 Gestion des Rôles

### Rôles disponibles
- **admin** : Accès complet + création d'utilisateurs
- **medecin** : Gestion patients, RDV, consultations
- **assistant** : Gestion RDV, voir patients (lecture seule)

### Protection des routes
Toutes les routes nécessitent authentification. Certaines routes spécifiques comme `/auth/register` nécessitent le rôle admin.

---

## ❌ Gestion des Erreurs

Toutes les erreurs suivent le format:
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

**Codes HTTP courants:**
- `200` : Succès
- `201` : Ressource créée
- `400` : Erreur de validation
- `401` : Non authentifié
- `403` : Non autorisé (rôle insuffisant)
- `404` : Ressource non trouvée
- `500` : Erreur serveur

---

## 🧪 Données de Test

### Comptes
- **Admin**: admin@vitaflow.com / Admin123!
- **Médecin**: medecin1@vitaflow.com / Medecin123!

### Patients
- **ID 1**: Mohammed Alaoui (+212661234567)
- **ID 2**: Fatima Benjelloun (+212662345678)

### Rendez-Vous
- 2 RDV créés pour le 01/03/2026 (09:00-09:30 et 10:00-10:30)

---

## 📝 Notes Techniques

### Auto-increment Patient ID
Les IDs patients sont auto-incrémentés de manière atomique via un modèle Counter. Ils ne sont **jamais réassignés** même en cas de suppression.

### Validation Rendez-Vous
- Durée minimum : 15 minutes
- Durée maximum : 3 heures
- Format horaire : HH:mm (ex: "09:30")
- Détection automatique des chevauchements par médecin

### Gestion Honoraires vs Montants Reçus
- **honoraire** : Montant total facturé pour la consultation
- **recu** : Montant effectivement payé par le patient (peut être différent : paiement partiel, impayé, etc.)
- Les statistiques de revenus utilisent le montant **reçu** (payé) et non l'honoraire
- Exemples : 
  - Consultation 500 TND, patient paie 500 TND → `honoraire: 500, recu: 500`
  - Consultation 500 TND, patient paie 300 TND → `honoraire: 500, recu: 300`
  - Consultation 500 TND, patient ne paie pas → `honoraire: 500, recu: 0`

### Tokens JWT
- **Access Token** : expire après 7 jours
- **Refresh Token** : expire après 30 jours
- Stockés dans le modèle User (refresh tokens)
