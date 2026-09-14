import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as userService from './user.service';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findById(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: userService.toSafeUser(user) },
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: { user: userService.toSafeUser(user) },
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  await userService.changePassword(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});
