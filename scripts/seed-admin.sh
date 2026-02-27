#!/bin/sh
# Script pour créer l'utilisateur admin par défaut dans le conteneur Docker

echo "🌱 Création du compte admin..."

docker-compose exec backend sh -c 'cat > /tmp/seed.js << "SEEDEOF"
const mongoose = require("mongoose");
const User = require("/app/dist/models/User").default;
const Counter = require("/app/dist/models/Counter").default;

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:vitaflow2024@mongodb:27017/cabinet?authSource=admin";

async function seedDatabase() {
  try {
    console.log("🔗 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const counterExists = await Counter.findById("patientId");
    if (!counterExists) {
      await Counter.create({ _id: "patientId", sequence: 0 });
      console.log("✅ Counter patientId initialisé");
    }

    const adminExists = await User.findOne({ email: "admin@vitaflow.com" });
    if (!adminExists) {
      await User.create({
        email: "admin@vitaflow.com",
        password: "adminadmin",
        nom: "Admin",
        prenom: "VitaFlow",
        role: "admin",
        isActive: true
      });
      console.log("✅ Admin créé: admin@vitaflow.com / adminadmin");
    } else {
      console.log("ℹ️  Admin existe déjà");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

seedDatabase();
SEEDEOF
cd /app && NODE_PATH=/app/node_modules node /tmp/seed.js'

echo ""
echo "✅ Vous pouvez maintenant vous connecter avec:"
echo "   Email: admin@vitaflow.com"
echo "   Mot de passe: adminadmin"
