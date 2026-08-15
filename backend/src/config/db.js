import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy backend/.env.example to backend/.env and add your MongoDB connection string.'
    );
  }
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('👋 MongoDB disconnected');
}
