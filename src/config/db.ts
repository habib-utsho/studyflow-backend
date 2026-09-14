import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

let connectPromise: Promise<typeof mongoose> | null = null;

// Serverless platforms (Vercel) can freeze/thaw instances between requests,
// silently dropping the TCP connection while frozen. Re-checking readyState
// on every call (instead of connecting once at boot) lets the app reconnect
// when that happens, rather than buffering queries against a dead socket.
export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        connectPromise = null;
        throw err;
      });
  }

  return connectPromise;
};

export const isDBConnected = (): boolean => mongoose.connection.readyState === 1;
