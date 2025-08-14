import { RequestHandler } from 'express';

import { CreateRevieOutput } from '../interfaces/review.interface';
import {
  AddReviewValidated,
  UpdateReviewValidated,
} from '../schemas/reviewSchema';
import { createReview, updateReviewStatus } from '../service/review.service';

export const addReview: RequestHandler = async (req, res, next) => {
  const { modId, text, userId } = (req.validated as AddReviewValidated).body;

  try {
    const review: CreateRevieOutput = await createReview({
      modId,
      text,
      userId,
    });
    return res.status(201).json(review);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateReview: RequestHandler = async (req, res, next) => {
  const { reviewId, status } = (req.validated as UpdateReviewValidated).body;

  try {
    await updateReviewStatus(reviewId, status);
  } catch (error: unknown) {
    next(error);
  }
};
