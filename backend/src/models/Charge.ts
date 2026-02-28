import mongoose, { Schema, Document } from 'mongoose';

export interface ICharge extends Document {
  date: Date;
  motif: string;
  montant: number;
  createdAt: Date;
  updatedAt: Date;
}

const chargeSchema = new Schema<ICharge>({
  date: {
    type: Date,
    required: [true, 'Date est requise'],
    default: Date.now
  },
  motif: {
    type: String,
    required: [true, 'Motif est requis'],
    trim: true
  },
  montant: {
    type: Number,
    required: [true, 'Montant est requis'],
    min: [0, 'Montant doit être positif']
  }
}, {
  timestamps: true
});

// Index pour recherche et tri
chargeSchema.index({ date: -1 });
chargeSchema.index({ motif: 'text' });

export default mongoose.model<ICharge>('Charge', chargeSchema);
