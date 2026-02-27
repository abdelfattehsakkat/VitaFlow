// Script de seed en JavaScript pour être exécuté dans le conteneur Docker
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration de la base de données
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:vitaflow2024@mongodb:27017/cabinet?authSource=admin';

// Schémas simplifiés
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  role: { type: String, enum: ['admin', 'medecin', 'assistant'], required: true },
  telephone: String,
  isActive: { type: Boolean, default: true },
  refreshTokens: [String]
}, { timestamps: true });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const counterSchema = new mongoose.Schema({
  _id: String,
  sequence: Number
});

const User = mongoose.model('User', userSchema);
const Counter = mongoose.model('Counter', counterSchema);

async function seedDatabase() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🌱 Seeding database...');

    // Initialiser le compteur pour patientId
    const counterExists = await Counter.findById('patientId');
    if (!counterExists) {
      await Counter.create({ _id: 'patientId', sequence: 0 });
      console.log('✅ Counter patientId initialisé à 0');
    } else {
      console.log('ℹ️  Counter patientId existe déjà');
    }

    // Créer admin par défaut
    const adminExists = await User.findOne({ email: 'admin@vitaflow.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@vitaflow.com',
        password: 'admin',
        nom: 'Admin',
        prenom: 'VitaFlow',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin créé: admin@vitaflow.com / admin');
    } else {
      console.log('ℹ️  Admin existe déjà');
    }

    console.log('✅ Seeding terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
