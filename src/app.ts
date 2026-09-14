import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env';
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

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
  },
});
app.use(globalLimiter);

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

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
