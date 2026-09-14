import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { sendResponse } from './utils/sendResponse';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.options('*', cors({ origin: env.CORS_ORIGINS, credentials: true }));

if (!env.isProduction) {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'StudyFlow API is running',
    data: {
      status: 'ok',
      uptime: process.uptime(),
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Health check successful',
    data: {
      status: 'ok',
      db: dbState,
    },
  });
});

app.use('/api', async (_req: Request, _res: Response, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});
app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
