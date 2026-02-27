import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // Le nom de la base de données est déjà dans MONGODB_URI
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
