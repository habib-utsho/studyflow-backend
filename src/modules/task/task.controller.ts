import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as taskService from './task.service';
import { GetTasksQuery } from './task.validation';

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const { tasks, meta } = await taskService.getTasks(req.user!.id, req.query as unknown as GetTasksQuery);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tasks retrieved successfully',
    meta,
    data: tasks,
  });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.user!.id, req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

export const toggleTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.toggleTask(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task deleted successfully',
    data: null,
  });
});

export const deleteCompletedTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.deleteCompletedTasks(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Completed tasks cleared successfully',
    data: result,
  });
});
