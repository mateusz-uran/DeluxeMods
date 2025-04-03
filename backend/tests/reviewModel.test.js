import mongoose from "mongoose";
import sinon from "sinon";
import Review from "../models/Review.js";
import { expect } from "chai";

const sandbox = sinon.createSandbox();

describe("Review model unit test", () => {
  let sampleReview;
  const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewText = "review text";

  beforeEach(async () => {
    sampleReview = new Review({
      author: userId,
      text: reviewText,
    });

    sampleReview.save = sandbox.stub().resolves(sampleReview);
    sandbox.stub(Review, "create").resolves(sampleReview);
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
});
