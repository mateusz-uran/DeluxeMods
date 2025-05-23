import mongoose from "mongoose";
import sinon from "sinon";
import Review from "../models/Review.js";
import { expect } from "chai";
import Mod from "../models/Mod.js";
import { populate } from "dotenv";

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

  describe("createReview", () => {
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

  describe("getSingleReview", () => {
    it("should return single review", async () => {
      const reviewSlug = "jonh-doe-class-83Ad";
      const fakeReview = {
        author: { name: "John Doe" },
        text: "Sample review content",
        mod: {
          name: "class",
          specification: {
            isDeluxe: true,
            link: "random-link",
            modAuthor: "dude",
          },
        },
      };

      const selectStub = sandbox.stub().returnsThis();
      const populateStub = sandbox.stub().resolves(fakeReview);

      sandbox
        .stub(Review, "findOne")
        .returns({ select: selectStub, populate: populateStub });

      const result = await Review.getSingleReview({ reviewSlug });

      expect(result).to.deep.equal({
        author: "John Doe",
        mod: {
          name: "class",
          specification: {
            isDeluxe: true,
            link: "random-link",
            modAuthor: "dude",
          },
        },
        text: "Sample review content",
      });
    });

    it("should throw an error if no reviewSlug is provided", async () => {
      try {
        await Review.getSingleReview({});
      } catch (err) {
        expect(err.message).to.equal("Review slug must be provided!");
      }
    });

    it("should throw an error if no review is found", async () => {
      const reviewSlug = "nonexistent-slug";

      const selectStub = sandbox.stub().returnsThis();
      const populateStub = sandbox.stub().resolves(null);

      sandbox
        .stub(Review, "findOne")
        .returns({ select: selectStub, populate: populateStub });

      try {
        await Review.getSingleReview({ reviewSlug });
      } catch (err) {
        expect(err.message).to.equal("Review not found!");
      }
    });
  });

  describe("updateReviewText", () => {
    it("should update review text and return updated version", async () => {
      const selectStub = sandbox.stub().resolves(updateReview);
      const findOneAndUpdateStub = sandbox
        .stub(Review, "findOneAndUpdate")
        .returns({ select: selectStub });

      const result = await Review.updateReviewText({
        reviewId,
        reviewText: updatedText,
        userId,
      });

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { _id: reviewId, author: userId },
          { $set: { text: updatedText, status: "UPDATED" } },
          { new: true }
        )
      ).to.be.true;

      expect(selectStub.calledOnceWithExactly("-_id text status")).to.be.true;
      expect(result.text).to.equal(updatedText);
      expect(result.status).to.equal("UPDATED");
    });

    it("should throw error when reviewId is incorrect or reviewText empty", async () => {
      try {
        await Review.updateReviewText({
          reviewId: null,
          reviewText: updatedText,
          userId,
        });
      } catch (error) {
        expect(error.message).to.equal("Review id cannot be empty!");
      }

      try {
        await Review.updateReviewText({
          reviewId: reviewId,
          reviewText: "",
          userId,
        });
      } catch (error) {
        expect(error.message).to.equal("Review must contain text!");
      }
    });

    it("should throw error when review was not found", async () => {
      const selectStub = sandbox.stub().resolves(null);
      sandbox.stub(Review, "findOneAndUpdate").returns({ select: selectStub });
      try {
        await Review.updateReviewText({
          reviewId,
          reviewText: updatedText,
          userId,
        });
      } catch (error) {
        expect(error.message).to.equal("Review not found!");
      }
    });
  });

  describe("getLastTenReviewsByUser", () => {
    it("should return last ten reviews", async () => {
      const fakeReviews = Array.from({ length: 10 }, (_, i) => ({
        author: userId,
        text: `random review text number ${i}`,
        status: "CREATED",
        mod: modId,
      }));

      const limitStub = sandbox.stub().returns(Promise.resolve(fakeReviews));
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const populateStub = sandbox.stub().returns({ sort: sortStub });
      const selectStub = sandbox.stub().returns({ populate: populateStub });
      sandbox.stub(Review, "find").returns({ select: selectStub });

      const result = await Review.getLastTenReviewsByUser({ userId });

      expect(result).to.be.an("array").that.has.lengthOf(10);
      expect(result[0].text).to.equal("random review text number 0");

      expect(selectStub.calledOnceWithExactly("-_id author text status")).to.be
        .true;
      expect(
        populateStub.calledOnceWithExactly({
          path: "mod",
          select: "name previewPhoto isDeluxe specification.modAuthor",
        })
      ).to.be.true;
    });
  });

  describe("getLastTenReviewsWithSpecificStatus", () => {
    it("should return last ten reviews with specific status", async () => {
      const fakeReviews = Array.from({ length: 5 }, (_, i) => ({
        author: userId,
        text: `random review text number ${i}`,
        status: "CREATED",
        mod: modId,
      }));

      const limitStub = sandbox.stub().returns(Promise.resolve(fakeReviews));
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const populateStub = sandbox.stub().returns({ sort: sortStub });
      const selectStub = sandbox.stub().returns({ populate: populateStub });
      sandbox.stub(Review, "find").returns({ select: selectStub });

      const result = await Review.getLastTenReviewsWithSpecificStatus({
        userId,
        status: "CREATED",
      });

      expect(result).to.be.an("array").that.has.lengthOf(5);
      expect(result[0].text).to.equal("random review text number 0");
    });
  });

  describe("getLastTenCreatedReviews", () => {
    it("should return last ten reviews with specific status", async () => {
      const fakeReviews = Array.from({ length: 10 }, (_, i) => ({
        author: { name: `User ${i}` },
        text: `random review text number ${i}`,
        status: "CREATED",
        mod: modId,
      }));

      const limitStub = sandbox.stub().resolves(fakeReviews);
      const sortStub = sandbox.stub().returns({ limit: limitStub });
      const populateModStub = sandbox
        .stub()
        .withArgs({
          path: "mod",
          select: "name previewPhoto isDeluxe specification.modAuthor -_id",
        })
        .returns({ sort: sortStub });
      const populateAuthorStub = sandbox
        .stub()
        .withArgs({ path: "author", select: "name -_id" })
        .returns({ populate: populateModStub });
      const selectStub = sandbox
        .stub()
        .withArgs("author text status createdAt -_id")
        .returns({ populate: populateAuthorStub });
      sandbox.stub(Review, "find").returns({ select: selectStub });

      const result = await Review.getLastTenCreatedReviews();

      expect(result).to.be.an("array").that.has.lengthOf(10);
      expect(result[0].text).to.equal("random review text number 0");
    });
  });

  describe("updateReviewStatus", () => {
    it("should update review status only", async () => {
      const review = {
        text: "some text",
        status: "DECLINED",
      };

      const selectStub = sandbox.stub().resolves(review);
      const findByIdAndUpdateStub = sandbox
        .stub(Review, "findByIdAndUpdate")
        .returns({ select: selectStub });

      const result = await Review.updateReviewStatus({
        reviewId,
        status: "DECLINED",
      });

      expect(result.status).to.equal("DECLINED");

      expect(
        findByIdAndUpdateStub.calledOnceWithExactly(
          reviewId,
          { $set: { status: "DECLINED" } },
          { new: true }
        )
      ).to.be.true;

      expect(selectStub.calledOnceWithExactly("-_id text status")).to.be.true;
    });
  });
});
