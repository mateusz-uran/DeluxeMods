import {
  CreateRevieOutput,
  CreateReviewInput,
} from '../interfaces/review.interface';
import Review from '../models/Review.js';
import { NotFoundError } from '../utils/errors/CustomError';
import { checkIfModExists, updateModReviewId } from './mod.service';
import { validateUserById } from './user.service';

export async function createReview(
  { userId, text, modId }: CreateReviewInput,
  {
    checkMod = checkIfModExists,
    updateMod = updateModReviewId,
    validateUser = validateUserById,
  } = {},
): Promise<CreateRevieOutput> {
  if (!(await checkMod(modId))) {
    throw new NotFoundError(`Mod not found.`, { modId }, true);
  }

  const user = await validateUser(userId);

  const review = await Review.create({ author: user._id, text });

  await updateMod(modId, review._id);

  return review;
}

export async function updateReviewStatus(
  reviewId: string,
  status: string,
): Promise<void> {
  await Review.findOneAndUpdate({ _id: reviewId }, { status }, { new: true });
}
