import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as authService from './auth.service';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Registered successfully',
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});
