import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

interface ISoin {
  _id: mongoose.Types.ObjectId;
  date: Date;
  dent?: string;
  description: string;
  honoraire: number;
  recu: number;
  createdAt: Date;
}

export interface IPatient extends Document {
  id: number;
  numeroPatient: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  telephone: string;
  email?: string;
  adresse?: string;
  mutuelle?: string;
  numeroMutuelle?: string;
  antecedents?: string;
  soins: ISoin[];
  totalHonoraires: number;
  totalRecu: number;
  derniereSoin?: ISoin;
  createdAt: Date;
  updatedAt: Date;
}

const soinSchema = new Schema<ISoin>({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dent: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description des soins est requise'],
    trim: true
  },
  honoraire: {
    type: Number,
    required: [true, 'Honoraire est requis'],
    min: [0, 'Honoraire doit être positif']
  },
  recu: {
    type: Schema.Types.Mixed,
    required: false,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const patientSchema = new Schema<IPatient>({
  id: {
    type: Number,
    unique: true,
    immutable: true
  },
  nom: {
    type: String,
    required: [true, 'Nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Prénom est requis'],
    trim: true
  },
  dateNaissance: {
    type: Date,
    required: [true, 'Date de naissance est requise']
  },
  telephone: {
    type: String,
    required: [true, 'Téléphone est requis'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  adresse: {
    type: String,
    trim: true
  },
  mutuelle: {
    type: String,
    trim: true
  },
  numeroMutuelle: {
    type: String,
    trim: true
  },
  antecedents: {
    type: String,
    trim: true
  },
  soins: [soinSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour recherche et performance
patientSchema.index({ nom: 1, prenom: 1 });
patientSchema.index({ id: 1 }, { unique: true });
patientSchema.index({ nom: 'text', prenom: 'text' });

// Virtual: numeroPatient formaté (P000001)
patientSchema.virtual('numeroPatient').get(function() {
  return `P${String(this.id).padStart(6, '0')}`;
});

// Virtual: total honoraires (montant facturé)
patientSchema.virtual('totalHonoraires').get(function() {
  if (!this.soins || this.soins.length === 0) return 0;
  return this.soins.reduce((sum, soin) => sum + soin.honoraire, 0);
});

// Virtual: total reçu (montant payé)
patientSchema.virtual('totalRecu').get(function() {
  if (!this.soins || this.soins.length === 0) return 0;
  return this.soins.reduce((sum, soin) => sum + (typeof soin.recu === 'number' ? soin.recu : 0), 0);
});

// Virtual: dernière soin
patientSchema.virtual('derniereSoin').get(function() {
  if (!this.soins || this.soins.length === 0) return null;
  return this.soins.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
});

// Pre-save: générer ID auto-increment (CRITIQUE)
patientSchema.pre('save', async function() {
  if (this.isNew) {
    this.id = await getNextSequence('patientId');
  }
});

// Pre-save: populate medecinNom si nouveau soin (désactivé)
// patientSchema.pre('save', async function() {
//   if (this.isModified('soins')) {
//     const User = mongoose.model('User');
//     for (const soin of this.soins) {
//       if (!soin.medecinNom && soin.medecinId) {
//         const medecin = await User.findById(soin.medecinId).select('nom prenom');
//         if (medecin) {
//           soin.medecinNom = `${medecin.nom} ${medecin.prenom}`;
//         }
//       }
//     }
//   }
// });

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPatient>('Patient', patientSchema);
