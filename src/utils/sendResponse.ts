import { Response } from 'express';

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

interface SendResponseOptions<T> {
  statusCode: number;
  success: true;
  message: string;
  meta?: Meta;
  data: T;
}

export const sendResponse = <T>(res: Response, options: SendResponseOptions<T>): void => {
  const { statusCode, success, message, meta, data } = options;

  res.status(statusCode).json({
    success,
    message,
    ...(meta ? { meta } : {}),
    data,
  });
};
