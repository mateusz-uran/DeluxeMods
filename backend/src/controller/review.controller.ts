import { RequestHandler } from 'express';
import { CreateRevieOutput } from '../interfaces/review.interface';
import { createReview, updateReviewStatus } from '../service/review.service';

export const addReview: RequestHandler = async (req, res, next) => {
  const { userId, text, modId } = req.validated?.body;

  try {
    const review: CreateRevieOutput = await createReview({
      userId,
      text,
      modId,
    });
    return res.status(201).json(review);
  } catch (error: any) {
    next(error);
  }
};

export const updateReview: RequestHandler = async (req, res, next) => {
  const { reviewId, status } = req.validated?.body;

  try {
    await updateReviewStatus(reviewId, status);
  } catch (error: any) {
    next(error);
  }
};
