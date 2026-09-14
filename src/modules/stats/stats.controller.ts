import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as statsService from './stats.service';

export const getOverview = catchAsync(async (req: Request, res: Response) => {
  const overview = await statsService.getOverview(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stats overview retrieved successfully',
    data: overview,
  });
});

export const getWeekly = catchAsync(async (req: Request, res: Response) => {
  const weekly = await statsService.getWeekly(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Weekly stats retrieved successfully',
    data: weekly,
  });
});

export const getBySubject = catchAsync(async (req: Request, res: Response) => {
  const bySubject = await statsService.getBySubject(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject stats retrieved successfully',
    data: bySubject,
  });
});
