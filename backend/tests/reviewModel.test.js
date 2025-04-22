import mongoose from "mongoose";
import sinon from "sinon";
import Review from "../models/Review.js";
import { expect } from "chai";
import Mod from "../models/Mod.js";

const sandbox = sinon.createSandbox();

describe("Review model unit test", () => {
  let sampleReview, updateReview, reviewStub, modStub, dummyMod;
  const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439022");
  const modId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const reviewText = "review text";
  const updatedText = "Updated review text";

  beforeEach(async () => {
    dummyMod = {
      _id: modId,
      name: "Test Mod",
      previewPhoto: "url",
      specification: {
        isDeluxe: false,
        name: "Spec Name",
        link: "http://example.com",
        authorName: "Author",
      },
      categories: [],
      isPublished: false,
    };
    modStub = sandbox.stub(Mod, "createMod").resolves(dummyMod);

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
    reviewStub = sandbox
      .stub(Review, "findByIdAndUpdate")
      .resolves(updateReview);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Add new review", () => {
    it("should create review with default status", async () => {
      const result = await Review.createReview({
        authorId: userId,
        reviewText,
        name: dummyMod.name,
        specification: dummyMod.specification,
        categories: dummyMod.categories,
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
    it("should update review text and returen updated version", async () => {
      const result = await Review.updateReviewText({
        authorId: userId,
        reviewId,
        reviewText: updatedText,
      });

      expect(result.text).to.equal(updatedText);
      expect(result.status).to.equal("UPDATED");
    });

    it("should throw error then authorId or reviewId is incorrect or reviewId is missing", async () => {
      try {
        await Review.updateReviewText({
          authroId: "incorrectUserId",
          reviewId,
          reviewText: updatedText,
        });
      } catch (error) {
        expect(error.message).to.equal("User not found!");
      }
      try {
        await Review.updateReviewText({authorId: userId, reviewId: null, reviewText: updatedText});
      } catch (error) {
        expect(error.message).to.equal("Review id cannot be empty!");
      }
      try {
        await Review.updateReviewText({authorId: userId, reviewId, reviewText: ""});
      } catch (error) {
        expect(error.message).to.equal("Review must contain text!");
      }
    });

    it("should throw an error when review was not found", async () => {
      reviewStub.resolves(null);
      try {
        await Review.updateReviewText({authorId: userId, reviewId, reviewText: updatedText});
      } catch (error) {
        expect(error.message).to.equal("Review not found!");
      }
    });
  });

  describe("Should return single mod", () => {
    it("should return single mod asigned to review with user", async () => {
      const review = new Review({
        _id: reviewId,
        author: userId,
        text: "random review text",
        status: "CREATED",
        save: sandbox.stub().resolves(),
        mod: modId,
      });
      const reviewFindStub = sandbox.stub(Review, "findOne").resolves(review);
      const modFindStub = sandbox.stub(Mod, "findById").resolves(dummyMod);

      const result = await Review.getModFromReviewByUser({ userId });

      expect(reviewFindStub.calledOnceWithExactly({ author: userId })).to.be
        .true;
      expect(modFindStub.calledOnceWithExactly(modId)).to.be.true;

      expect(result).to.deep.equal(dummyMod);
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
});
