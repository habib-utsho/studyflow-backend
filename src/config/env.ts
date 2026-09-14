import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv({ quiet: true });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const parsedEnv = parsed.data;

export const env = {
  PORT: parsedEnv.PORT,
  MONGODB_URI: parsedEnv.MONGODB_URI,
  JWT_SECRET: parsedEnv.JWT_SECRET,
  JWT_EXPIRES_IN: parsedEnv.JWT_EXPIRES_IN,
  NODE_ENV: parsedEnv.NODE_ENV,
  CORS_ORIGINS: parsedEnv.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  RATE_LIMIT_MAX: parsedEnv.RATE_LIMIT_MAX,
  isProduction: parsedEnv.NODE_ENV === 'production',
};
