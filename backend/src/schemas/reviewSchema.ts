import z from 'zod';

import { STATUS_TYPES } from '../interfaces/review.interface';

export const addReviewSchema = z.object({
  body: z.object({
    modId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid modId format'),
    text: z.string().min(3, { message: 'Review text required' }),
    userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
  }),
});

export type AddReviewValidated = z.infer<typeof addReviewSchema>;

export const updateReviewSchema = z.object({
  body: z.object({
    reviewId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
    status: z.enum(Object.values(STATUS_TYPES)),
  }),
});

export type UpdateReviewValidated = z.infer<typeof updateReviewSchema>;