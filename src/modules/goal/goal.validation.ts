import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    subject: objectId.optional(),
    target: z.coerce.number().int().positive('Target must be at least 1'),
    deadline: z.coerce.date().optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
      subject: objectId.nullable().optional(),
      target: z.coerce.number().int().positive('Target must be at least 1').optional(),
      deadline: z.coerce.date().nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

export const goalIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>['body'];
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>['body'];
