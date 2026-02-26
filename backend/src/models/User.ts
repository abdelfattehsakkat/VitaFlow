import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'medecin' | 'assistant';
  telephone?: string;
  isActive: boolean;
  refreshTokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [8, 'Mot de passe minimum 8 caractères'],
    select: false
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
  role: {
    type: String,
    enum: ['admin', 'medecin', 'assistant'],
    required: [true, 'Rôle est requis']
  },
  telephone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    type: String
  }]
}, {
  timestamps: true
});

// Hash password avant save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  this.password = await bcrypt.hash(this.password, rounds);
});

// Méthode compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode statique hash password
userSchema.statics.hashPassword = async function(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, rounds);
};

export default mongoose.model<IUser>('User', userSchema);
