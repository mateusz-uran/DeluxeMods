import mongoose from "mongoose";
import Mod from "./Mod.js";
import User from "./User.js";
import { createLongerSlug } from "../utils/slug.utils.js";

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ["CREATED", "REVIEWED", "DECLINED", "UPDATED"],
    default: "CREATED",
  },
  slug: { type: String, required: true },
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

  const author = await User.findById(authorId);
  if (!author) throw Error("Author not found!");

  const reviewSlug = createLongerSlug(author.name, mod.name);

  return this.create({
    author: authorId,
    text: reviewText,
    mod: mod._id,
    slug: reviewSlug,
  });
};

reviewSchema.statics.getSingleReview = async function ({ reviewSlug }) {
  if (!reviewSlug) {
    throw Error("Review slug must be provided!");
  }

  const review = await this.findOne({
    slug: reviewSlug,
    status: "REVIEWED",
  })
    .select("-_id author text")
    .populate([
      {
        path: "author",
        select: "name",
      },
      {
        path: "mod",
        select: "name specification",
      },
    ]);

  if (!review) {
    throw Error("Review not found!");
  }

  return {
    author: review.author.name,
    text: review.text,
    mod: {
      name: review.mod.name,
      specification: {
        isDeluxe: review.mod.specification.isDeluxe,
        link: review.mod.specification.link,
        modAuthor: review.mod.specification.modAuthor,
      },
    },
  };
};

reviewSchema.statics.updateReviewText = async function ({
  reviewId,
  reviewText,
  userId,
}) {
  if (!reviewId) {
    throw Error("Review id cannot be empty!");
  }

  if (!reviewText || reviewText === "" || reviewText.length === 0) {
    throw Error("Review must contain text!");
  }

  const updatedReview = await this.findOneAndUpdate(
    { _id: reviewId, author: userId },
    {
      $set: { text: reviewText, status: "UPDATED" },
    },
    { new: true }
  ).select("-_id text status");

  if (!updatedReview) {
    throw Error("Review not found!");
  }

  return updatedReview;
};

reviewSchema.statics.getLastTenReviewsByUser = async function ({ userId }) {
  if (!userId) {
    throw new Error("User ID must be provided.");
  }

  const reviews = await this.find({ author: userId })
    .select("-_id author text status")
    .populate({
      path: "mod",
      select:
        "-_id name previewPhoto specification.modAuthor specification.isDeluxe ",
    })
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
    .select("-_id author text status")
    .populate({
      path: "mod",
      select: "-_id name previewPhoto isDeluxe specification.modAuthor",
    })
    .sort({ createdAt: -1 })
    .limit(10);

  return reviews;
};

reviewSchema.statics.getLastTenCreatedReviews = async function () {
  const reviews = await this.find({ status: "CREATED" })
    .select("-_id text status")
    .populate({ path: "author", select: "-_id name" })
    .populate({
      path: "mod",
      select: "-_id name previewPhoto isDeluxe specification.modAuthor slug",
    })
    .sort({ createdAt: -1 })
    .limit(10);

  return reviews;
};

reviewSchema.statics.updateReviewStatus = async function ({
  reviewId,
  status,
}) {
  const updatedReview = await this.findByIdAndUpdate(
    reviewId,
    {
      $set: { status },
    },
    { new: true }
  ).select("-_id text status");

  if (!updatedReview) {
    throw Error("Review not found!");
  }

  return updatedReview;
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
