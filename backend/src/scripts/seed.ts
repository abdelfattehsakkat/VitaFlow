import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Counter from '../models/Counter';
import { connectDB } from '../config/db';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

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
        password: 'Admin123!',
        nom: 'Admin',
        prenom: 'VitaFlow',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin créé: admin@vitaflow.com / Admin123!');
    } else {
      console.log('ℹ️  Admin existe déjà');
    }

    console.log('✅ Seeding terminé avec succès!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur lors du seeding:', error.message);
    process.exit(1);
  }
};

seedData();
