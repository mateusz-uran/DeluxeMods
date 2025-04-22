import mongoose from "mongoose";
import Mod from "./Mod.js";

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ["CREATED", "REVIEWED", "DECLINED", "UPDATED"],
    default: "CREATED",
  },
  mod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mod",
    required: true,
    unique: true,
  },
});

reviewSchema.statics.createReview = async function ({
  authorId,
  reviewText,
  name,
  specification,
  categories,
  previewPhoto,
}) {
  if (!authorId) {
    throw Error("User not found!");
  }

  if (!reviewText || reviewText === "" || reviewText.length === 0) {
    throw Error("Review must contain text!");
  }

  const mod = await Mod.createMod({
    name,
    previewPhoto,
    specification,
    categories,
  });

  const review = await this.create({
    author: authorId,
    text: reviewText,
    mod: mod._id,
  });
  return review;
};

reviewSchema.statics.updateReviewText = async function ({
  authorId,
  reviewId,
  reviewText,
}) {
  if (!authorId) {
    throw Error("User not found!");
  }
  if (!reviewId) {
    throw Error("Review id cannot be empty!");
  }

  if (!reviewText || reviewText === "" || reviewText.length === 0) {
    throw Error("Review must contain text!");
  }

  const updatedReview = await this.findByIdAndUpdate(
    reviewId,
    {
      text: reviewText,
      status: "UPDATED",
    },
    { new: true }
  );

  if (!updatedReview) {
    throw Error("Review not found!");
  }

  return updatedReview;
};

reviewSchema.statics.getModFromReviewByUser = async function ({ userId }) {
  const review = await this.findOne({ author: userId });

  if (!review) {
    throw new Error("Review for given user not found!");
  }

  const mod = await Mod.findById(review.mod);

  if (!mod) {
    throw new Error("Mod not found!");
  }

  return mod;
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
