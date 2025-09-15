import app from '../../app';
import request from 'supertest';
import { createFakeModsInsideDB } from '../helpers/mods.helper';
import { createTestRole } from '../helpers/role.helper';
import {
  createTestUserWithRole,
  CreateUserOutput,
} from '../helpers/user.helper';
import { createFakeReviewsInsideDB } from '../helpers/review.helper';
import Review from '../../models/Review';

describe('Review controller integration test', () => {
  describe('POST /review/save', () => {
    const endpoint = '/review/save';
    const fakeModID = '507f1f77bcf86cd799439011';
    const fakeUserID = '507f1f77bcf86cd799439011';
    let admin: CreateUserOutput;
    let mods: any;

    beforeEach(async () => {
      const totalMods = 1;
      await createTestRole([{ name: 'ADMIN', permissions: ['ADD_REVIEW'] }]);

      [admin] = await createTestUserWithRole({ roleName: 'ADMIN' });

      mods = await createFakeModsInsideDB(
        totalMods,
        () => Math.random() > 0.5,
        (i) => i < totalMods,
        (i) => {
          if (i < 8) return ['small'];
          return ['plow/subsoiler', 'seeder/planter'];
        },
      );
    });

    it('should create review and update mod with review ID', async () => {
      const reviewText = 'REVIEW_TEXT';

      const response = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          modId: mods[0]._id,
          modName: mods[0].name,
          text: reviewText,
          userId: admin.userId,
        });

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        author: admin.userId.toString(),
        status: 'CREATED',
        text: reviewText,
      });
      expect(response.body.slug).toBeDefined();
    });

    it('should fail creating review due to Mod not found', async () => {
      const reviewText = 'REVIEW_TEXT';

      const response = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          modId: fakeModID,
          modName: mods[0].name,
          text: reviewText,
          userId: admin.userId,
        });

      expect(response.status).toBe(404);
      expect(response.body.errors[0].message).toBe('Mod not found.');
    });

    it('should fail if user is unauthorized', async () => {
      const reviewText = 'REVIEW_TEXT';

      const response = await request(app)
        .post(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          modId: mods[0]._id,
          modName: mods[0].name,
          text: reviewText,
          userId: fakeUserID,
        });

      expect(response.status).toBe(401);
      expect(response.body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('PATCH /review/update/:reviewId', () => {
    let admin: CreateUserOutput;
    let reviews: any;

    beforeEach(async () => {
      const totalMods = 1;
      await createTestRole([{ name: 'ADMIN', permissions: ['UPDATE_REVIEW'] }]);

      [admin] = await createTestUserWithRole({ roleName: 'ADMIN' });

      reviews = await createFakeReviewsInsideDB(1, admin.userId);
    });

    it('should change review status from CREATED to REVIEWED', async () => {
      const reviewStatus = 'REVIEWED';
      const endpoint = `/review/update/${reviews[0]._id}`;

      const response = await request(app)
        .patch(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          status: reviewStatus,
        });

      expect(response.status).toBe(200);

      const updatedReview = await Review.findById(reviews[0]._id).lean();
      expect(updatedReview).toBeDefined();
      expect(updatedReview?.status).toBe(reviewStatus);
    });

    it('should return error when review not found', async () => {
      const reviewStatus = 'REVIEWED';
      const fakeReviewID = '507f1f77bcf86cd799439011';
      const endpoint = `/review/update/${fakeReviewID}`;

      const response = await request(app)
        .patch(endpoint)
        .set('Cookie', admin.cookies.join('; '))
        .send({
          status: reviewStatus,
        });
      expect(response.status).toBe(404);
    });
  });
});
