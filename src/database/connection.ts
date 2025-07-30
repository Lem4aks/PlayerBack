import mongoose from 'mongoose';
import ENV from '@src/common/constants/ENV';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = ENV.Mongodb;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};