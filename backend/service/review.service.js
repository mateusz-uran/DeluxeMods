import Review from "../models/Review.js";
import { checkIfModExists, updateModReviewId } from "./mod.service.js";

export async function createReview({ author, text, modId }) {
  if (!(await checkIfModExists(modId))) {
    throw new Error("Mod not found!");
  }

  const review = Review.create({ author, text });

  await updateModReviewId(review._id);

  return review;
}
