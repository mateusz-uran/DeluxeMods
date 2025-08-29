import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createFakeCategoriesInsideDB } from '../helpers/categories.helper';
import app from '../../app';

describe('Mod categories controller integration test', () => {
  describe('GET getCategories', () => {
    const endpoint = '/categories/all';

    it('should return all categories', async () => {
      await createFakeCategoriesInsideDB([
        { name: 'Tractors', subCategories: ['Small', 'Medium'] },
        { name: 'Trailers', subCategories: ['Mixer wagon'] },
      ]);

      const res = await request(app).get(endpoint);
      expect(res.status).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);

      expect(res.body).toEqual(
        expect.arrayContaining([
          {
            name: 'Tractors',
            subCategory: [
              { name: 'Small', slug: 'small' },
              { name: 'Medium', slug: 'medium' },
            ],
          },
          {
            name: 'Trailers',
            subCategory: [{ name: 'Mixer wagon', slug: 'mixer-wagon' }],
          },
        ]),
      );
    });

    it('should return empty array when DB has no categories', async () => {
      const res = await request(app).get(endpoint);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it('should handle categories with partial subcategories', async () => {
      await createFakeCategoriesInsideDB([
        { name: 'Tractors', subCategories: ['Small'] },
        { name: 'Trailers', subCategories: [] },
      ]);

      const res = await request(app).get(endpoint);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          {
            name: 'Tractors',
            subCategory: [{ name: 'Small', slug: 'small' }],
          },
          {
            name: 'Trailers',
            subCategory: [],
          },
        ]),
      );
    });
  });
});
