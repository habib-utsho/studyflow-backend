import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    subject: objectId.optional(),
    goal: objectId.optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional(),
    minutes: z.coerce.number().int().positive('Minutes must be a positive number').optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
      subject: objectId.nullable().optional(),
      goal: objectId.nullable().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      dueDate: z.coerce.date().nullable().optional(),
      minutes: z.coerce.number().int().positive('Minutes must be a positive number').optional(),
      completed: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

export const taskIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    completed: z.enum(['true', 'false']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    subject: objectId.optional(),
    due: z.enum(['today', 'week', 'overdue']).optional(),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.string().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>['query'];
