import dns from 'node:dns';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

// Local dev workaround: some routers/ISPs can't resolve the mongodb+srv DNS
// record, so force Node to use Google's DNS for the lookup. Skipped in
// production/Vercel, where forcing a custom resolver can break outbound DNS.
if (!env.isProduction) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

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
