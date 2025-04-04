import mongoose from "mongoose";
import sinon from "sinon";
import Review from "../models/Review.js";
import { expect } from "chai";

const sandbox = sinon.createSandbox();

describe("Review model unit test", () => {
  let sampleReview, updateReview, reviewStub;
  const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439022");
  const reviewText = "review text";
  const updatedText = "Updated review text";

  beforeEach(async () => {
    sampleReview = new Review({
      author: userId,
      text: reviewText,
    });

    updateReview = new Review({
      _id: reviewId,
      author: userId,
      text: updatedText,
      status: "UPDATED",
      save: sandbox.stub().resolves(),
    });

    sampleReview.save = sandbox.stub().resolves(sampleReview);
    sandbox.stub(Review, "create").resolves(sampleReview);
    reviewStub = sandbox.stub(Review, "findByIdAndUpdate").resolves(updateReview);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Add new review", () => {
    it("should create review with default status", async () => {
      const result = await Review.createReview(userId, reviewText);
      expect(result.text).to.equal(reviewText);
      expect(result.status).to.equal("CREATED");
    });

    it("should throw error when userId is missing", async () => {
      try {
        await Review.createReview(null, reviewText);
      } catch (err) {
        expect(err.message).to.equal("User not found!");
      }
    });

    it("should throw error when review text is empty", async () => {
      try {
        await Review.createReview(userId, null);
      } catch (err) {
        expect(err.message).to.equal("Review must contain text!");
      }
    });
  });

  describe("Update review", () => {
    it("should update review text and returen updated version", async () => {
      const result = await Review.updateReviewText(
        userId,
        reviewId,
        updatedText
      );

      expect(result.text).to.equal(updatedText);
      expect(result.status).to.equal("UPDATED");
    });

    it("should throw error then authorId or reviewId is incorrect or reviewId is missing", async () => {
      try {
        await Review.updateReviewText("incorrectUserId", reviewId, updatedText);
      } catch (error) {
        expect(error.message).to.equal("User not found!");
      }
      try {
        await Review.updateReviewText(userId, null, updatedText);
      } catch (error) {
        expect(error.message).to.equal("Review id cannot be empty!");
      }
      try {
        await Review.updateReviewText(userId, reviewId, "");
      } catch (error) {
        expect(error.message).to.equal("Review must contain text!");
      }
    });

    it("should throw an error when review was not found", async () => {
      reviewStub.resolves(null);
      try {
        await Review.updateReviewText(userId, reviewId, updatedText);
      } catch (error) {
        expect(error.message).to.equal("Review not found!");
      }
    });
  });
});
