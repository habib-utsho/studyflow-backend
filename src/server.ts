// node 24 + mongoose If your local network's DNS (like a router or ISP) cannot resolve the SRV record, you can force Node.js to use Google's DNS (8.8.8.8) directly in your code:
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google DNS for SRV lookups
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const server = app.listen(env.PORT, () => {
      console.log(`StudyFlow API listening on port ${env.PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
