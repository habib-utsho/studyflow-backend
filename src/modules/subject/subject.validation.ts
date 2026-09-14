import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Subject name is required').max(40, 'Subject name cannot exceed 40 characters'),
    color: z.string().trim().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex code'),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().trim().min(1, 'Subject name is required').max(40, 'Subject name cannot exceed 40 characters').optional(),
      color: z.string().trim().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex code').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

export const subjectIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>['body'];
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>['body'];
