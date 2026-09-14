import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import * as subjectService from './subject.service';

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const subjects = await subjectService.getSubjects(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subjects retrieved successfully',
    data: subjects,
  });
});

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await subjectService.createSubject(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subject created successfully',
    data: subject,
  });
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await subjectService.updateSubject(req.user!.id, req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject updated successfully',
    data: subject,
  });
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  await subjectService.deleteSubject(req.user!.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject deleted successfully',
    data: null,
  });
});
