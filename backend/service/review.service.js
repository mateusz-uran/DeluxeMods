import Review from "../models/Review.js";
import { checkIfModExists, updateModReviewId } from "./mod.service.js";
import { validateUserById } from "./user.service.js";

export async function createReview({ author, text, modId }) {
  if (!(await checkIfModExists(modId))) {
    throw new Error("Mod not found!");
  }

  const user = await validateUserById(author);

  const review = await Review.create({ author: user._id, text });

  await updateModReviewId(modId, review._id);

  return review;
}

export async function updateReviewStatus(reviewId, status) {
  return await Review.findOneAndUpdate(reviewId, { status }, { new: true });
}
