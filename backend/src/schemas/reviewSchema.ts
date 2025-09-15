import z from 'zod';

import { STATUS_TYPES } from '../interfaces/review.interface';

export const addReviewSchema = z.object({
  body: z.object({
    modId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid modId format'),
    modName: z.string().min(5, { message: 'Mod name is too short' }),
    text: z.string().min(3, { message: 'Review text required' }),
    userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
  }),
});
export type AddReviewValidated = z.infer<typeof addReviewSchema>;

export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
  }),
  body: z.object({
    status: z.enum(Object.values(STATUS_TYPES)),
  }),
});
export type UpdateReviewValidated = z.infer<typeof updateReviewSchema>;

export const getReviewWithModQuerySchema = z.object({
  query: z.object({
    slug: z
      .string()
      .min(5, {message: "Minimum 5 characters."})
      .max(150, {message: "Slug is too long."})
      .regex(/^[A-Za-z0-9-]+$/),
  }),
});
export type GetReviewWithModValidated = z.infer<
  typeof getReviewWithModQuerySchema
>;
