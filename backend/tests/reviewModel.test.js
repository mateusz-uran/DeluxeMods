import mongoose from "mongoose";
import sinon from "sinon";
import Review from "../models/Review.js";
import { expect } from "chai";
import Mod from "../models/Mod.js";

const sandbox = sinon.createSandbox();

describe("Review model unit test", () => {
  let sampleReview, updateReview;
  const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439022");
  const modId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewText = "review text";
  const updatedText = "Updated review text";

  beforeEach(() => {
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
  });

  afterEach(() => {
    sandbox.restore();
  });

  function stubCreateReview(dummyMod) {
    sandbox.stub(Mod, "createMod").resolves(dummyMod);
    sandbox.stub(Review, "create").resolves(sampleReview);
  }

  describe("Add new review", () => {
    it("should create review with default status", async () => {
      const dummyMod = { _id: modId, name: "Test Mod", previewPhoto: "url" };
      stubCreateReview(dummyMod);

      const result = await Review.createReview({
        authorId: userId,
        reviewText,
        name: dummyMod.name,
        specification: {},
        categories: [],
        previewPhoto: dummyMod.previewPhoto,
      });

      expect(result.text).to.equal(reviewText);
      expect(result.status).to.equal("CREATED");
    });

    it("should throw error when userId is missing", async () => {
      try {
        await Review.createReview({ authorId: null });
      } catch (err) {
        expect(err.message).to.equal("User not found!");
      }
    });

    it("should throw error when review text is empty", async () => {
      try {
        await Review.createReview({ authorId: userId, reviewText: null });
      } catch (err) {
        expect(err.message).to.equal("Review must contain text!");
      }
    });
  });

  describe("Update review", () => {
    it("should update review text and return updated version", async () => {
      sandbox.stub(Review, "findByIdAndUpdate").resolves(updateReview);

      const result = await Review.updateReviewText({
        reviewId,
        reviewText: updatedText,
      });

      expect(result.text).to.equal(updatedText);
      expect(result.status).to.equal("UPDATED");
    });

    it("should throw error when reviewId is incorrect or reviewText empty", async () => {
      try {
        await Review.updateReviewText({
          reviewId: null,
          reviewText: updatedText,
        });
      } catch (error) {
        expect(error.message).to.equal("Review id cannot be empty!");
      }

      try {
        await Review.updateReviewText({
          reviewId: reviewId,
          reviewText: "",
        });
      } catch (error) {
        expect(error.message).to.equal("Review must contain text!");
      }
    });

    it("should throw error when review was not found", async () => {
      sandbox.stub(Review, "findByIdAndUpdate").resolves(null);

      try {
        await Review.updateReviewText({
          reviewId,
          reviewText: updatedText,
        });
      } catch (error) {
        expect(error.message).to.equal("Review not found!");
      }
    });

    it("should update review status only", async () => {
      const fakeUpdatedReview = {
        _id: reviewId,
        text: "Some review",
        status: "DECLINED",
      };

      sandbox.stub(Review, "findByIdAndUpdate").resolves(fakeUpdatedReview);

      const result = await Review.updateReviewStatus({
        reviewId,
        status: "DECLINED",
      });

      expect(result.status).to.equal("DECLINED");
      expect(result._id.toString()).to.equal(reviewId.toString());
    });
  });

  describe("Get Mod from Review", () => {
    it("should return single mod assigned to review with user", async () => {
      const review = new Review({
        _id: reviewId,
        author: userId,
        text: "random review text",
        status: "CREATED",
        save: sandbox.stub().resolves(),
        mod: modId,
      });

      sandbox.stub(Review, "findOne").resolves(review);
      sandbox.stub(Mod, "findById").resolves({ _id: modId, name: "Test Mod" });

      const result = await Review.getModFromReviewByUser({ userId });

      expect(result.name).to.equal("Test Mod");
    });

    it("should throw error if review not found", async () => {
      sandbox.stub(Review, "findOne").resolves(null);

      try {
        await Review.getModFromReviewByUser({ userId });
      } catch (error) {
        expect(error.message).to.equal("Review for given user not found!");
      }
    });

    it("should throw error if mod not found", async () => {
      sandbox.stub(Review, "findOne").resolves({
        _id: reviewId,
        author: userId,
        text: "random review text",
        status: "CREATED",
        mod: modId,
      });

      sandbox.stub(Mod, "findById").resolves(null);

      try {
        await Review.getModFromReviewByUser({ userId });
      } catch (error) {
        expect(error.message).to.equal("Mod not found!");
      }
    });
  });

  describe("Get last ten reviews", () => {
    it("should return last ten reviews", async () => {
      const fakeReviews = Array.from({ length: 10 }, (_, i) => ({
        author: userId,
        text: `random review text number ${i}`,
        status: "CREATED",
        mod: modId,
      }));

      sandbox.stub(Review, "find").returns({
        populate: () => ({
          sort: () => ({
            limit: () => Promise.resolve(fakeReviews),
          }),
        }),
      });

      const result = await Review.getLastTenReviews({ userId });

      expect(result).to.be.an("array").that.has.lengthOf(10);
      expect(result[0].text).to.equal("random review text number 0");
    });
  });
});
