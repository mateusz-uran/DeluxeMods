import express from 'express';

import { addReview, updateReview } from '../controller/review.controller';
import { cookieAuthorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validate';
import { addReviewSchema, updateReviewSchema } from '../schemas/reviewSchema';

const router = express.Router();

router.post(
  '/review-add',
  validateRequest(addReviewSchema),
  cookieAuthorize(['ADD_REVIEW']),
  addReview,
);

router.post(
  '/update-status',
  validateRequest(updateReviewSchema),
  cookieAuthorize(['UPDATE_REVIEW']),
  updateReview,
);

export default router;
