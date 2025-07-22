import { expect } from "chai";
import sinon from "sinon";
import { createReview, updateReviewStatus } from "../../service/review.service.js";
import Review from "../../models/Review.js";

describe("Review service unit tests", () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  describe("createReview", () => {
    const dummyUser = { _id: "user123", name: "Alice" };
    const dummyReview = {
      _id: "review456",
      text: "Great mod!",
      author: dummyUser._id,
    };

    const input = {
      author: "user123",
      text: "Great mod!",
      modId: "mod789",
    };

    const checkModStub = sinon.stub();
    const validateUserStub = sinon.stub();
    const updateModStub = sinon.stub();

    const createStub = sinon.stub();

    beforeEach(() => {
      sandbox.stub(Review, "create").resolves(dummyReview);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should create review and update mod", async () => {
      checkModStub.resolves(true);
      validateUserStub.resolves(dummyUser);
      updateModStub.resolves();

      const result = await createReview(
        input,
        checkModStub,
        updateModStub,
        validateUserStub
      );

      expect(checkModStub.calledOnceWithExactly(input.modId)).to.be.true;
      expect(validateUserStub.calledOnceWithExactly(input.author)).to.be.true;
      expect(
        Review.create.calledOnceWithExactly({
          author: dummyUser._id,
          text: input.text,
        })
      ).to.be.true;
      expect(updateModStub.calledOnceWithExactly(input.modId, dummyReview._id))
        .to.be.true;

      expect(result).to.deep.equal(dummyReview);
    });

    it("should throw error if mod does not exist", async () => {
      checkModStub.resolves(false);

      try {
        await createReview(
          input,
          checkModStub,
          updateModStub,
          validateUserStub
        );
        throw new Error("Expected error was not thrown");
      } catch (err) {
        expect(err.message).to.equal("Mod not found!");
      }
    });
  });

  describe("updateReviewStatus", () => {
    const reviewId = "review123";
    const status = "approved";

    const updatedReview = {
      _id: reviewId,
      text: "Nice mod!",
      status: "approved",
    };

    beforeEach(() => {
      sandbox.stub(Review, "findOneAndUpdate").resolves(updatedReview);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should update review status and return updated review", async () => {
      const result = await updateReviewStatus(reviewId, status);

      expect(
        Review.findOneAndUpdate.calledOnceWithExactly(
          reviewId,
          { status },
          { new: true }
        )
      ).to.be.true;

      expect(result).to.deep.equal(updatedReview);
    });

    it("should return null if review not found", async () => {
      Review.findOneAndUpdate.resolves(null); // simulate not found

      const result = await updateReviewStatus("nonexistent-id", status);

      expect(result).to.be.null;
    });

    it("should throw if Review.findOneAndUpdate throws", async () => {
      const error = new Error("DB error");
      Review.findOneAndUpdate.rejects(error);

      try {
        await updateReviewStatus(reviewId, status);
        throw new Error("Expected error not thrown");
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
});
