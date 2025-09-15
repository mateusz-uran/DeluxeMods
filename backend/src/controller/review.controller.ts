import { RequestHandler } from 'express';

import { CreateRevieOutput } from '../interfaces/review.interface';
import {
  AddReviewValidated,
  GetReviewWithModValidated,
  UpdateReviewValidated,
} from '../schemas/reviewSchema';
import {
  createReview,
  getSingleReviewWithMod,
  updateReviewStatus,
} from '../service/review.service';

export const addReview: RequestHandler = async (req, res, next) => {
  const { modId, modName, text, userId } = (req.validated as AddReviewValidated)
    .body;

  try {
    const review: CreateRevieOutput = await createReview({
      modId,
      modName,
      text,
      userId,
    });
    return res.status(201).json(review);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateReview: RequestHandler = async (req, res, next) => {
  const { reviewId } = (req.validated as UpdateReviewValidated).params;
  const { status } = (req.validated as UpdateReviewValidated).body;

  try {
    await updateReviewStatus(reviewId, status);
    return res.sendStatus(200);
  } catch (error: unknown) {
    next(error);
  }
};

export const getReviewByMod: RequestHandler = async (req, res, next) => {
  const { slug } = (req.validated as GetReviewWithModValidated).query;

  try {
    const review = await getSingleReviewWithMod(slug);
    return res.status(200).json(review);
  } catch (error: unknown) {
    next(error);
  }
};
