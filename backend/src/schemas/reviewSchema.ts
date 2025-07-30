import z from 'zod';
import { STATUS_TYPES } from '../interfaces/review.interface';

export const addReviewSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
    text: z.string().min(3, { message: 'Review text required' }),
    modId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid modId format'),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    reviewId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
    status: z.enum(Object.values(STATUS_TYPES)),
  }),
});
