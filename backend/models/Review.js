import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ["CREATED", "REVIEWED", "DECLINED"],
    default: "CREATED",
  },
});

reviewSchema.statics.createReview = async function (authorId, reviewText) {
  if (!authorId) {
    throw Error("User not found!");
  }

  if (!reviewText) {
    throw Error("Review must contain text!");
  }

  const review = await this.create({
    author: authorId,
    text: reviewText,
  });

  return review;
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
