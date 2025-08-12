import request from 'supertest';
import app from '../../app';
import {
  createFakeCategoriesInsideDB,
  createFakeModsInsideDB,
} from '../helpers/mods.helper';
import { createTestRole } from '../helpers/role.helper';
import {
  createTestUserWithRole,
  CreateUserOutput,
} from '../helpers/user.helper';

import { beforeEach, describe, expect, it } from 'vitest';

describe('Mod controller integration test', () => {
  describe('GET getModsByParameter', () => {
    const endpoint = '/mod/all';

    beforeEach(async () => {
      const totalMods = 14;
      const publishedCount = 14;

      await createFakeModsInsideDB(
        totalMods,
        () => Math.random() > 0.5,
        (i) => i < publishedCount,
        (i) => {
          if (i < 8) return ['small'];
          return ['plow/subsoiler', 'seeder/planter'];
        },
      );
    });

    it('should return last six mods', async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('mods');
      expect(res.body.mods).toBeInstanceOf(Array);
      
      expect(res.body.mods.length).toBeLessThanOrEqual(6);
    });

    it('should return last six mods by category small', async () => {
      const res = await request(app).get(endpoint).query({ category: 'small' });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('mods');
      expect(res.body.mods).toBeInstanceOf(Array);
      expect(res.body.mods.length).toBeLessThanOrEqual(6);
      expect(res.body.mods.every((m: any) => m.categories.includes('small'))).toBe(true);
    });

    it('should return mods from 2nd page', async () => {
      const res = await request(app)
        .get(endpoint)
        .query({ category: 'small', page: 2 });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('mods');
      expect(res.body.mods).toBeInstanceOf(Array);
      expect(res.body.mods.length).toEqual(2);
      expect(res.body.mods.every((m: any) => m.categories.includes('small'))).toBe(true);
      expect(res.body.totalCount).toEqual(8);
    });

    it('should return empty array for non-existing category', async () => {
      const res = await request(app)
        .get(endpoint)
        .query({ category: 'nonexistent' });

      expect(res.status).toEqual(200);
      expect(res.body.mods).toBeInstanceOf(Array);
      expect(res.body.mods).toHaveLength(0);
      expect(res.body.totalCount).toEqual(0);
    });

    it('should return empty array for page number with no results', async () => {
      const res = await request(app)
        .get(endpoint)
        .query({ category: 'small', page: 10 });

      expect(res.status).toEqual(200);
      expect(res.body.mods).toBeInstanceOf(Array);
      expect(res.body.mods).toHaveLength(0);
      expect(res.body.totalCount).toEqual(8);
    });

    it('should return 400 for invalid page parameter', async () => {
      const res = await request(app).get(endpoint).query({ page: 'abc' });

      expect(res.status).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 for negative page number', async () => {
      const res = await request(app).get(endpoint).query({ page: '-1' });

      expect(res.status).toEqual(400);
    });
  });

  describe('POST /mods/save', () => {
    const endpoint = '/mod/save';
    let admin: CreateUserOutput;

    beforeEach(async () => {
      await createTestRole([{ name: 'ADMIN', permissions: ['ADD_REVIEW'] }]);

      [admin] = await createTestUserWithRole({ roleName: 'ADMIN' });

      await createFakeCategoriesInsideDB([
        { name: 'Tractors', subCategories: ['small', 'medium'] },
      ]);
    });

    // it('should create a mod', async () => {
    //   const res = await request(app)
    //     .post(endpoint)
    //     .set('Cookie', admin.cookies.join('; '))
    //     .attach('photo', Buffer.from('fakeimage'), 'mod.jpg')
    //     .field('name', 'Test Mod')
    //     .field(
    //       'specification',
    //       JSON.stringify({
    //         link: 'http://some-link.com',
    //         modAuthor: 'JohnDoe',
    //       }),
    //     )
    //     .field('categories', ['small']);
    // });
  });
});
