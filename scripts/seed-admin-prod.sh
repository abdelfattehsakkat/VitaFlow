#!/bin/bash
# Script de seed pour production VPS
# Crée un compte admin par défaut dans le conteneur Docker backend

set -e

echo "🌱 Création du compte admin en production..."

# Vérifier que le backend est en cours d'exécution
if ! docker ps | grep -q "vitaflow-backend-prod"; then
    echo "❌ Erreur: Le conteneur backend n'est pas en cours d'exécution"
    echo "Lancez d'abord: docker compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Créer le compte admin dans le conteneur
docker exec vitaflow-backend-prod node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB');
    
    // Import des modèles compilés
    const User = require('/app/dist/models/User.js').default;
    const Counter = require('/app/dist/models/Counter.js').default;
    
    // Créer le counter pour les IDs patients
    const counter = await Counter.findOneAndUpdate(
      { _id: 'patientId' },
      { \$setOnInsert: { seq: 0 } },
      { upsert: true, new: true }
    );
    console.log('✅ Counter initialisé');
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@vitaflow.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin existe déjà: admin@vitaflow.com');
      process.exit(0);
    }
    
    // Créer l'admin (le pre-save hook hachera le mot de passe)
    await User.create({
      email: 'admin@vitaflow.com',
      password: 'adminadmin',
      nom: 'Admin',
      prenom: 'VitaFlow',
      role: 'admin',
      telephone: '0600000000',
      isActive: true
    });
    
    console.log('✅ Admin créé: admin@vitaflow.com / adminadmin');
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seed();
"

echo ""
echo "✅ Seed terminé avec succès !"
echo ""
echo "📝 Identifiants de connexion:"
echo "   Email: admin@vitaflow.com"
echo "   Mot de passe: adminadmin"
echo ""
echo "⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !"
