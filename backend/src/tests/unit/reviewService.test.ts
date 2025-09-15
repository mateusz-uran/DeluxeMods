import type { MockInstance } from 'vitest';

import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IReview, STATUS_TYPES } from '../../interfaces/review.interface';
import Review from '../../models/Review';
import {
  createReview,
  getSingleReview,
  updateReviewStatus,
} from '../../service/review.service';
import { NotFoundError } from '../../utils/errors/CustomError';

describe('Review service unit tests', () => {
  describe('createReview', () => {
    const fakeUser = { _id: new Types.ObjectId(), name: 'John Doe' };

    const reviewInput = {
      modId: 'mod789',
      modName: 'bestMODever',
      text: 'Great mod!',
      userId: 'user123',
    };
    const reviewSlug = 'bestMODever-somedude-812ads';

    const reviewOutput: IReview = {
      _id: new Types.ObjectId(),
      author: fakeUser._id,
      slug: reviewSlug,
      status: STATUS_TYPES.CREATED,
      text: 'Great mod!',
    } as unknown as IReview;

    beforeEach(() => {
      vi.spyOn(Review, 'create').mockResolvedValue(reviewOutput as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create review and update mod', async () => {
      const fakeCheckMod = vi.fn().mockReturnValue(true);
      const fakeUpdateMod = vi.fn();
      const fakeValidateUser = vi
        .fn()
        .mockImplementation((id) =>
          id === reviewInput.userId ? fakeUser : null,
        );
      const fakeSlugCreated = vi.fn().mockResolvedValue(reviewSlug);

      const result = await createReview(reviewInput, {
        checkMod: fakeCheckMod,
        updateMod: fakeUpdateMod,
        validateUser: fakeValidateUser,
        createSlugForReview: fakeSlugCreated,
      });

      expect(fakeCheckMod).toHaveBeenCalledTimes(1);
      expect(fakeValidateUser).toHaveBeenCalledTimes(1);
      expect(fakeValidateUser).toHaveBeenCalledWith(reviewInput.userId);

      expect(fakeUpdateMod).toHaveBeenCalledTimes(1);
      expect(fakeUpdateMod).toHaveBeenCalledWith(
        reviewInput.modId,
        reviewOutput._id,
      );

      expect(fakeSlugCreated).toHaveBeenCalledTimes(1);

      expect(result.author).toEqual(fakeUser._id);
      expect(result.status).toBe(STATUS_TYPES.CREATED);
      expect(result.slug).toBe(reviewSlug);
    });

    it('should throw error if mod does not exist', async () => {
      const fakeCheckMod = vi.fn().mockResolvedValue(false);
      const fakeUpdateMod = vi.fn();
      const fakeValidateUser = vi.fn().mockReturnValue(fakeUser);

      await expect(
        createReview(reviewInput, {
          checkMod: fakeCheckMod,
          updateMod: fakeUpdateMod,
          validateUser: fakeValidateUser,
        }),
      ).rejects.toThrow('Mod not found.');
    });
  });

  describe('updateReviewStatus', () => {
    const reviewId = 'review123';
    const status = 'approved';

    let findOneAndUpdateSpy: MockInstance;

    beforeEach(() => {
      findOneAndUpdateSpy = vi.spyOn(Review, 'findOneAndUpdate');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should update review status with correct arguments', async () => {
      findOneAndUpdateSpy.mockResolvedValue(undefined);

      await updateReviewStatus(reviewId, status);

      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { _id: reviewId },
        { status },
        { new: true },
      );
    });

    it('should throw if Review.findOneAndUpdate throws', async () => {
      findOneAndUpdateSpy.mockRejectedValue(new NotFoundError('Review not found.'));

      await expect(updateReviewStatus(reviewId, status)).rejects.toThrow(
        'Review not found.',
      );
    });

    describe('getSingleReview', () => {
      const reviewId = '64f123456789abcdef012345';

      it('should return review', async () => {
        const reviewMock = {
          author: { username: 'JohnDoe' },
          slug: 'test-review-slug',
          text: 'This is a test review',
        };

        const leanMock = vi.fn().mockResolvedValue(reviewMock);
        const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
        const populateMock = vi.fn().mockReturnValue({ select: selectMock });
        vi.spyOn(Review, 'findOne').mockReturnValue({
          populate: populateMock,
        } as any);

        const result = await getSingleReview(reviewId);

        expect(result).toEqual(reviewMock);
      });

      it('should throw error when mod not found', async () => {
        const leanMock = vi.fn().mockResolvedValue(null);
        const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
        const populateMock = vi.fn().mockReturnValue({ select: selectMock });
        vi.spyOn(Review, 'findOne').mockReturnValue({
          populate: populateMock,
        } as any);

        await expect(getSingleReview(reviewId)).rejects.toThrow(
          'Review with given id not found.',
        );
      });
    });
  });
});
