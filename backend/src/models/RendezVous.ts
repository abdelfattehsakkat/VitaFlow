import mongoose, { Schema, Document } from 'mongoose';

export interface IRendezVous extends Document {
  patientId: mongoose.Types.ObjectId;
  patientNom: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  statut: 'planifie' | 'confirme' | 'termine' | 'annule';
  motif?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rendezvousSchema = new Schema<IRendezVous>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientNom: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: [true, 'Date est requise']
  },
  heureDebut: {
    type: String,
    required: [true, 'Heure de début est requise'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide (HH:mm)']
  },
  heureFin: {
    type: String,
    required: [true, 'Heure de fin est requise'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format heure invalide (HH:mm)']
  },
  statut: {
    type: String,
    enum: ['planifie', 'confirme', 'termine', 'annule'],
    default: 'planifie'
  },
  motif: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes pour performance
rendezvousSchema.index({ date: 1 });
rendezvousSchema.index({ patientId: 1, date: -1 });

// Validation custom: heureDebut < heureFin
rendezvousSchema.pre('validate', function() {
  if (this.heureDebut >= this.heureFin) {
    throw new Error('Heure de début doit être avant heure de fin');
  }
  
  // Vérifier durée (15min - 3h)
  const [h1, m1] = this.heureDebut.split(':').map(Number);
  const [h2, m2] = this.heureFin.split(':').map(Number);
  const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  
  if (minutes < 15) {
    throw new Error('Durée minimum: 15 minutes');
  }
  if (minutes > 180) {
    throw new Error('Durée maximum: 3 heures');
  }
});

export default mongoose.model<IRendezVous>('RendezVous', rendezvousSchema);
