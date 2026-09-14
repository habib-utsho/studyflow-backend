import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.filter((segment) => segment !== 'body' && segment !== 'query' && segment !== 'params').join('.'),
        message: issue.message,
      }));

      throw ApiError.badRequest('Validation failed', errors);
    }

    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.params !== undefined) req.params = parsed.params as Request['params'];
    if (parsed.query !== undefined) {
      Object.assign(req.query, parsed.query);
    }

    next();
  };
};
