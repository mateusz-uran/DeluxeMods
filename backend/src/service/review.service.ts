import {
  CreateRevieOutput,
  CreateReviewInput,
  GetReviewWithMod,
  GetSingleReview,
} from '../interfaces/review.interface';
import Review from '../models/Review';
import { NotFoundError } from '../utils/errors/CustomError';
import { createSlugFromTwoTexts } from '../utils/slug.utils';
import {
  checkIfModExists,
  getSingleMod,
  updateModReviewId,
} from './mod.service';
import { validateUserById } from './user.service';

export async function createReview(
  { modId, modName, text, userId }: CreateReviewInput,
  {
    checkMod = checkIfModExists,
    updateMod = updateModReviewId,
    validateUser = validateUserById,
    createSlugForReview = createSlugFromTwoTexts
  } = {},
): Promise<CreateRevieOutput> {
  if (!(await checkMod(modId))) {
    throw new NotFoundError(`Mod not found.`, { modId }, true);
  }

  const user = await validateUser(userId);

  const reviewSlug = createSlugForReview(user.name, modName)

  const review = await Review.create({ author: user._id, text, slug: reviewSlug });

  await updateMod(modId, review._id);

  return review;
}

export async function updateReviewStatus(
  reviewId: string,
  status: string,
): Promise<void> {
  await Review.findOneAndUpdate({ _id: reviewId }, { status }, { new: true });
}

export async function getSingleReviewWithMod(
  slug: string,
): Promise<GetReviewWithMod> {
  const mod = await getSingleMod(slug);

  if (!mod.reviewId) {
    throw new NotFoundError('Review not found for given mod.', { slug }, true);
  }

  const review = await getSingleReview(mod.reviewId);

  const { name, previewPhoto, isDeluxe, specification } = mod;
  const { author, slug: reviewSlug, text } = review;

  return {
    name,
    previewPhoto,
    isDeluxe,
    specification,
    username: author.username,
    slug: reviewSlug,
    text,
  };
}

export async function getSingleReview(id: any): Promise<GetSingleReview> {
  const review = await Review.findOne({ _id: id })
    .populate('author', 'username -_id')
    .select('-_id author slug -status text')
    .lean<{ author: { username: string }; slug: string; text: string }>();

  if (!review) {
    throw new NotFoundError(
      'Review with given id not found.',
      { id: id },
      true,
    );
  }

  return review as GetSingleReview;
}
