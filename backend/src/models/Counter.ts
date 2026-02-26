import mongoose, { Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.model<ICounter>('Counter', counterSchema);

/**
 * Génère le prochain numéro de séquence de manière atomique
 * CRITIQUE: Cette fonction garantit que les IDs patients ne sont JAMAIS réattribués
 */
export const getNextSequence = async (counterName: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
};

export default Counter;
