import { expect } from 'chai';
import sinon from 'sinon';
import { createReview, updateReviewStatus } from '../../service/review.service';
import Review from '../../models/Review';
import { IReview, STATUS_TYPES } from '../../interfaces/review.interface';
import { Types } from 'mongoose';

describe('Review service unit tests', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  describe('createReview', () => {
    const fakeUser = { _id: new Types.ObjectId(), name: 'John Doe' };

    const reviewInput = {
      userId: 'user123',
      text: 'Great mod!',
      modId: 'mod789',
    };

    const reviewOutput: IReview = {
      _id: new Types.ObjectId(),
      author: fakeUser._id,
      text: 'Great mod!',
      status: STATUS_TYPES.CREATED,
      slug: 'test-slug',
    } as unknown as IReview;

    let sandbox: sinon.SinonSandbox;
    let fakeCheckMod;
    let fakeUpdateMod;
    let fakeValidateUser;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(Review, 'create').resolves(reviewOutput as any);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should create review and update mod', async () => {
      fakeCheckMod = sandbox.stub().resolves(true);
      fakeUpdateMod = sandbox.stub();
      fakeValidateUser = sandbox.stub().resolves(fakeUser);

      const result = await createReview(reviewInput, {
        checkMod: fakeCheckMod,
        updateMod: fakeUpdateMod,
        validateUser: fakeValidateUser,
      });

      expect(fakeCheckMod.calledOnceWithExactly(reviewInput.modId)).to.be.true;
      expect(fakeValidateUser.calledOnceWithExactly(reviewInput.userId)).to.be
        .true;
      expect(
        fakeUpdateMod.calledOnceWithExactly(
          reviewInput.modId,
          reviewOutput._id,
        ),
      ).to.be.true;

      expect(result.author).to.deep.equal(fakeUser._id);

      expect(result.status).to.equal(STATUS_TYPES.CREATED);
    });

    it('should throw error if mod does not exist', async () => {
      fakeCheckMod = sandbox.stub().resolves(false);
      fakeUpdateMod = sandbox.stub();
      fakeValidateUser = sandbox.stub().resolves(fakeUser);

      try {
        await createReview(reviewInput, {
          checkMod: fakeCheckMod,
          updateMod: fakeUpdateMod,
          validateUser: fakeValidateUser,
        });
        throw new Error('Expected error was not thrown');
      } catch (err: any) {
        expect(err.message).to.equal('Mod not found.');
      }
    });
  });

  describe('updateReviewStatus', () => {
    const reviewId = 'review123';
    const status = 'approved';

    let findOneAndUpdateStub: sinon.SinonStub;

    beforeEach(() => {
      findOneAndUpdateStub = sandbox.stub(Review, 'findOneAndUpdate');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should update review status with correct arguments', async () => {
      findOneAndUpdateStub.resolves();
      await updateReviewStatus(reviewId, status);

      expect(
        findOneAndUpdateStub.calledOnceWithExactly(
          { _id: reviewId },
          { status },
          { new: true },
        ),
      ).to.be.true;
    });

    it('should throw if Review.findOneAndUpdate throws', async () => {
      const error = new Error('DB error');
      findOneAndUpdateStub.rejects(error);

      try {
        await updateReviewStatus(reviewId, status);
        throw new Error('Expected error not thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
});
