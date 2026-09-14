import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { ApiError, ApiErrorDetail } from '../utils/ApiError';

const handleCastError = (err: mongoose.Error.CastError): ApiError => {
  return ApiError.badRequest(`Invalid value for field '${err.path}'`);
};

const handleValidationError = (err: mongoose.Error.ValidationError): ApiError => {
  const errors: ApiErrorDetail[] = Object.values(err.errors).map((val) => ({
    path: val.path,
    message: val.message,
  }));
  return ApiError.badRequest('Validation failed', errors);
};

const handleDuplicateKeyError = (err: { keyValue?: Record<string, unknown> }): ApiError => {
  const keys = err.keyValue ? Object.keys(err.keyValue).filter((key) => key !== 'user') : [];
  const field = keys[0] ?? (err.keyValue ? Object.keys(err.keyValue)[0] : 'field');
  const value = err.keyValue ? err.keyValue[field] : '';
  return ApiError.conflict(`${field} '${value}' is already in use`);
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = handleCastError(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    apiError = handleValidationError(err);
  } else if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000) {
    apiError = handleDuplicateKeyError(err as { keyValue?: Record<string, unknown> });
  } else if (err instanceof Error) {
    apiError = ApiError.internal(env.isProduction ? 'Something went wrong. Please try again.' : err.message);
  } else {
    apiError = ApiError.internal('Something went wrong. Please try again.');
  }

  if (!env.isProduction && apiError.statusCode === 500) {
    console.error(err);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors ? { errors: apiError.errors } : {}),
  });
};
