import { faker } from '@faker-js/faker';
import { STATUS_TYPES } from '../../interfaces/review.interface';
import Review from '../../models/Review';

export const createFakeReviewsInsideDB = (size: number, user: any) => {
  const promises = Array.from({ length: size }, async (_, i) => {
    return await Review.create({
      author: user._id,
      slug: 'fake-mod-john-doe-xyz-123',
      status: STATUS_TYPES.CREATED,
      text: faker.lorem.lines(),
    });
  });

  return Promise.all(promises);
};
