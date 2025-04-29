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
  slugs,
  previewPhoto,
}) {
  if (!authorId) throw Error("User not found!");

  if (!reviewText?.trim()) throw Error("Review must contain text!");

  const mod = await Mod.createMod({
    name,
    previewPhoto,
    specification,
    slugs,
  });

  return this.create({
    author: authorId,
    text: reviewText,
    mod: mod._id,
  });
};

reviewSchema.statics.updateReviewText = async function ({
  reviewId,
  reviewText,
}) {
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

reviewSchema.statics.getLastTenReviews = async function ({ userId }) {
  if (!userId) {
    throw new Error("User ID must be provided.");
  }

  const reviews = await this.find({ author: userId })
    .populate("mod")
    .sort({ createdAt: -1 })
    .limit(10);

  return reviews;
};

reviewSchema.statics.getLastTenReviewsWithSpecificStatus = async function ({
  userId,
  status,
}) {
  if (!userId) {
    throw new Error("User ID must be provided.");
  }

  if (!status) {
    throw new Error("Status must be provided.");
  }

  let fixedStatus = status.trim().toUpperCase();

  const reviews = await this.find({ author: userId, status: fixedStatus })
    .populate("mod")
    .sort({ createdAt: -1 })
    .limit(10);

  return reviews;
};

reviewSchema.statics.getReviewByUserAndModName = async function ({
  userId,
  modName,
}) {
  if (!userId) {
    throw new Error("User ID must be provided.");
  }

  if (!modName) {
    throw new Error("Mod name must be provided.");
  }

  const mod = await Mod.findOne({ name: modName });

  if (!mod) {
    throw new Error("Mod not found!");
  }

  const reviews = await this.findOne({ author: userId, mod: mod._id }).populate(
    "mod"
  );

  return reviews;
};

reviewSchema.statics.getLastTenCreatedReviews = async function () {
  const reviews = await this.find({ status: "CREATED" }).populate("mod");

  return reviews;
};

reviewSchema.statics.updateReviewStatus = async function ({
  reviewId,
  status,
}) {
  const updatedReview = await this.findByIdAndUpdate(
    reviewId,
    {
      status,
    },
    { new: true }
  );

  if (!updatedReview) {
    throw Error("Review not found!");
  }

  return updatedReview;
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
