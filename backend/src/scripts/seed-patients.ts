import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import Patient from '../models/Patient';
import User from '../models/User';
import Counter from '../models/Counter';

// Charger les variables d'environnement
config({ path: path.resolve(__dirname, '../../.env') });

// Noms tunisiens
const nomsTunisiens = [
  'Ben Ali', 'Bourguiba', 'Trabelsi', 'Hamdi', 'Karoui', 'Jebali', 'Belhaj',
  'Khedher', 'Abidi', 'Agrebi', 'Ayari', 'Belaid', 'Bouazizi', 'Chahed',
  'Dridi', 'Essid', 'Ferchichi', 'Ghannouchi', 'Haddad', 'Jabeur',
  'Kacem', 'Lamine', 'Mabrouk', 'Nouri', 'Ouertani', 'Rebai', 'Slimani',
  'Tounsi', 'Yahyaoui', 'Zaouali', 'Bouslama', 'Chaieb', 'Daoud', 'Elloumi',
  'Ferjani', 'Gharbi', 'Hizaoui', 'Jendoubi', 'Kharrat', 'Mokni', 'Najar',
  'Oueslati', 'Rejeb', 'Sahli', 'Tlili', 'Youssef', 'Zouari', 'Ben Salah',
  'Ben Ammar', 'Ben Amor', 'Ben Hamida', 'Ben Mabrouk', 'Ben Abdallah'
];

const prenomsMasculins = [
  'Mohamed', 'Ahmed', 'Ali', 'Khalil', 'Youssef', 'Mehdi', 'Amine', 'Sami',
  'Rami', 'Tarek', 'Firas', 'Walid', 'Karim', 'Anis', 'Nabil', 'Hichem',
  'Makram', 'Aymen', 'Bilel', 'Hazem', 'Riadh', 'Sofien', 'Zied', 'Maher',
  'Rachid', 'Samir', 'Taoufik', 'Faouzi', 'Hatem', 'Chokri', 'Adel', 'Hedi'
];

const prenomsFeminins = [
  'Fatma', 'Amel', 'Leila', 'Sonia', 'Amira', 'Nadia', 'Maha', 'Salma',
  'Rania', 'Ines', 'Meriem', 'Olfa', 'Rim', 'Hend', 'Nour', 'Yasmine',
  'Soumaya', 'Emna', 'Sihem', 'Wafa', 'Lamia', 'Mouna', 'Samia', 'Houda',
  'Aicha', 'Khadija', 'Najoua', 'Zohra', 'Latifa', 'Souad', 'Afef', 'Dorra'
];

const villes = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana',
  'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul',
  'Tataouine', 'Beja', 'Jendouba', 'Mahdia', 'Siliana', 'Manouba', 'Zaghouan'
];

const rues = [
  'Avenue Habib Bourguiba', 'Rue de la République', 'Avenue de la Liberté',
  'Rue Ibn Khaldoun', 'Avenue Mohamed V', 'Rue de Carthage', 'Avenue de France',
  'Rue du Japon', 'Avenue Farhat Hached', 'Rue Mongi Slim', 'Avenue Ali Bach Hamba',
  'Rue de Marseille', 'Avenue Charles Nicolle', 'Rue de Palestine', 'Avenue Hedi Chaker'
];

const mutuelles = ['CNSS', 'CNRPS', 'CNAM', 'Assurances Salim', 'Assurances Maghrebia', 'Carte Santé'];

const descriptionsConsultations = [
  'Consultation générale',
  'Visite de contrôle',
  'Consultation de suivi',
  'Consultation urgente',
  'Bilan de santé',
  'Consultation + examens',
  'Consultation + ordonnance',
  'Renouvellement ordonnance',
  'Certificat médical',
  'Consultation post-opératoire',
  'Consultation pré-opératoire',
  'Vaccination',
  'Consultation dermatologique',
  'Consultation cardiologique',
  'Consultation ORL',
  'Consultation pédiatrique'
];

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhone(): string {
  const prefixes = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];
  return `+216${randomItem(prefixes)}${random(100000, 999999)}`;
}

async function seedPatients() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017', {
      dbName: process.env.MONGODB_DB_NAME || 'vitaflow',
    });
    console.log('✅ Connecté à MongoDB');

    // Récupérer un médecin ou un admin
    let medecin = await User.findOne({ role: 'medecin' });
    if (!medecin) {
      medecin = await User.findOne({ role: 'admin' });
    }
    if (!medecin) {
      console.error('❌ Aucun médecin ou admin trouvé. Créez d\'abord un utilisateur avec npm run seed');
      process.exit(1);
    }
    console.log(`👨‍⚕️ Médecin: Dr. ${medecin.nom} ${medecin.prenom}`);

    // Vérifier le compteur actuel
    let counter = await Counter.findOne({ _id: 'Patient' });
    const startId = counter ? counter.sequence + 1 : 1;
    console.log(`📊 Prochain ID patient: ${startId}`);

    console.log('🗑️ Suppression des anciens patients...');
    // Optionnel: Supprimer les patients existants (commenté pour préserver les données)
    // await Patient.deleteMany({});
    // await Counter.findOneAndUpdate({ model: 'Patient' }, { seq: 0 }, { upsert: true });

    console.log('📝 Génération de 200 patients...');
    const patients = [];

    for (let i = 0; i < 200; i++) {
      const isFeminin = Math.random() > 0.5;
      const prenom = randomItem(isFeminin ? prenomsFeminins : prenomsMasculins);
      const nom = randomItem(nomsTunisiens);
      
      // Date de naissance (entre 1 et 90 ans)
      const age = random(1, 90);
      const dateNaissance = new Date();
      dateNaissance.setFullYear(dateNaissance.getFullYear() - age);
      dateNaissance.setMonth(random(0, 11));
      dateNaissance.setDate(random(1, 28));

      // Adresse
      const numeroRue = random(1, 300);
      const rue = randomItem(rues);
      const ville = randomItem(villes);
      const adresse = `${numeroRue} ${rue}, ${ville}`;

      // Mutuelle (70% des patients ont une mutuelle)
      const aMutuelle = Math.random() > 0.3;
      const mutuelle = aMutuelle ? randomItem(mutuelles) : undefined;
      const numeroMutuelle = aMutuelle ? `${random(100000, 999999)}` : undefined;

      // Email (50% des patients)
      const aEmail = Math.random() > 0.5;
      const email = aEmail ? `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s/g, '')}${random(1, 999)}@email.tn` : undefined;

      // Générer les soins (entre 2 et 10)
      const nbSoins = random(2, 10);
      const soins = [];
      
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      for (let j = 0; j < nbSoins; j++) {
        const dateSoin = randomDate(oneYearAgo, today);
        const honoraire = random(50, 500);
        const tauxRemboursement = mutuelle ? random(50, 100) / 100 : 0;
        const recu = Math.round(honoraire * tauxRemboursement);

        soins.push({
          date: dateSoin,
          description: randomItem(descriptionsConsultations),
          honoraire: honoraire,
          recu: recu,
          medecinId: medecin._id,
          medecinNom: `Dr. ${medecin.nom} ${medecin.prenom}`,
          createdAt: dateSoin
        });
      }

      // Trier les soins par date
      soins.sort((a, b) => a.date.getTime() - b.date.getTime());

      const patientData = {
        nom,
        prenom,
        dateNaissance,
        telephone: generatePhone(),
        email,
        adresse,
        mutuelle,
        numeroMutuelle,
        antecedents: Math.random() > 0.7 ? 'Aucun antécédent particulier' : undefined,
        soins
      };

      patients.push(patientData);

      // Afficher la progression tous les 20 patients
      if ((i + 1) % 20 === 0) {
        console.log(`   ✓ ${i + 1}/200 patients générés`);
      }
    }

    console.log('💾 Insertion dans la base de données...');
    const results = [];
    for (const patientData of patients) {
      const patient = new Patient(patientData);
      await patient.save();
      results.push(patient);
    }

    console.log('✅ Seed terminé avec succès!');
    console.log(`📊 ${results.length} patients créés`);
    console.log(`🔢 IDs: P${String(startId).padStart(6, '0')} à P${String(startId + results.length - 1).padStart(6, '0')}`);
    
    // Statistiques
    const totalSoins = results.reduce((sum, p) => sum + p.soins.length, 0);
    const totalHonoraires = results.reduce((sum, p) => sum + (p.totalHonoraires || 0), 0);
    const totalRecu = results.reduce((sum, p) => sum + (p.totalRecu || 0), 0);
    
    console.log(`\n📈 Statistiques:`);
    console.log(`   Total consultations: ${totalSoins}`);
    console.log(`   Total honoraires: ${totalHonoraires.toFixed(2)} TND`);
    console.log(`   Total reçu: ${totalRecu.toFixed(2)} TND`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedPatients();
