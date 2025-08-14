import type { MockInstance } from 'vitest';

import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IReview, STATUS_TYPES } from '../../interfaces/review.interface';
import Review from '../../models/Review';
import { createReview, updateReviewStatus } from '../../service/review.service';

describe('Review service unit tests', () => {
  describe('createReview', () => {
    const fakeUser = { _id: new Types.ObjectId(), name: 'John Doe' };

    const reviewInput = {
      modId: 'mod789',
      text: 'Great mod!',
      userId: 'user123',
    };

    const reviewOutput: IReview = {
      _id: new Types.ObjectId(),
      author: fakeUser._id,
      slug: 'test-slug',
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

      const result = await createReview(reviewInput, {
        checkMod: fakeCheckMod,
        updateMod: fakeUpdateMod,
        validateUser: fakeValidateUser,
      });

      expect(fakeCheckMod).toHaveBeenCalledTimes(1);
      expect(fakeValidateUser).toHaveBeenCalledTimes(1);
      expect(fakeValidateUser).toHaveBeenCalledWith(reviewInput.userId);

      expect(fakeUpdateMod).toHaveBeenCalledTimes(1);
      expect(fakeUpdateMod).toHaveBeenCalledWith(
        reviewInput.modId,
        reviewOutput._id,
      );

      expect(result.author).toEqual(fakeUser._id);
      expect(result.status).toBe(STATUS_TYPES.CREATED);
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
      const error = new Error('DB error');
      findOneAndUpdateSpy.mockRejectedValue(error);

      await expect(updateReviewStatus(reviewId, status)).rejects.toThrow(error);
    });
  });
});
