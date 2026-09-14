import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as goalService from './goal.service';

export const getGoals = catchAsync(async (req: Request, res: Response) => {
  const goals = await goalService.getGoals(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Goals retrieved successfully',
    data: goals,
  });
});

export const createGoal = catchAsync(async (req: Request, res: Response) => {
  const goal = await goalService.createGoal(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Goal created successfully',
    data: goal,
  });
});

export const getGoalById = catchAsync(async (req: Request, res: Response) => {
  const goal = await goalService.getGoalById(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Goal retrieved successfully',
    data: goal,
  });
});

export const updateGoal = catchAsync(async (req: Request, res: Response) => {
  const goal = await goalService.updateGoal(req.user!.id, req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Goal updated successfully',
    data: goal,
  });
});

export const deleteGoal = catchAsync(async (req: Request, res: Response) => {
  await goalService.deleteGoal(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Goal deleted successfully',
    data: null,
  });
});
