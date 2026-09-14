import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthUser } from '../types/express';

export const auth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('You are not authorized. Please log in.');
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    throw ApiError.unauthorized('Your session is invalid or has expired. Please log in again.');
  }
};
