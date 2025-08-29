import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  MockInstance,
  vi,
} from 'vitest';

import {
  checkIfCategoryExists,
  getAllCategories,
} from '../../service/modCategories.service';
import { createFakeCategories } from '../helpers/categories.helper';
import ModCategories from '../../models/ModCategories';

describe('Mod categories service unit tests', () => {
  const categories = createFakeCategories();

  beforeEach(() => {});

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllCategories', () => {
    beforeEach(() => {
      const leanMock = vi.fn().mockResolvedValue(categories);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      vi.spyOn(ModCategories, 'find').mockReturnValue({
        select: selectMock,
      } as any);
    });

    it('should get all categories', async () => {
      const result = await getAllCategories();

      expect(result).toHaveLength(categories.length);

      expect(result).toEqual(categories);
    });

    it('should return empty array when no categories exist', async () => {
      const leanMock = vi.fn().mockResolvedValue([]);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      vi.spyOn(ModCategories, 'find').mockReturnValue({
        select: selectMock,
      } as any);

      const result = await getAllCategories();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw when database query fails', async () => {
      const error = new Error('DB error');
      const leanMock = vi.fn().mockRejectedValue(error);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      vi.spyOn(ModCategories, 'find').mockReturnValue({
        select: selectMock,
      } as any);

      await expect(getAllCategories()).rejects.toThrow('DB error');
    });

    it('should map subCategories correctly', async () => {
      const categories = [
        {
          name: 'Tractors',
          subCategory: [
            { name: 'Small', slug: 'small' },
            { name: 'Medium', slug: 'medium' },
          ],
        },
      ];

      const leanMock = vi.fn().mockResolvedValue(categories);
      const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
      vi.spyOn(ModCategories, 'find').mockReturnValue({
        select: selectMock,
      } as any);

      const result = await getAllCategories();

      expect(result[0].subCategory).toEqual([
        { name: 'Small', slug: 'small' },
        { name: 'Medium', slug: 'medium' },
      ]);
    });
  });

  describe('checkIfCategoryExists', () => {
    it('should return matching slugs when subcategories exist', async () => {
      const inputSlugs = [
        categories[0].subCategory[0].slug, // first tractor subcategory
        categories[0].subCategory[1].slug, // second tractor subcategory
      ];

      vi.spyOn(ModCategories, 'find').mockResolvedValue(categories as any);

      const result = await checkIfCategoryExists(inputSlugs);

      expect(result).toEqual(inputSlugs);
    });

    it('should return empty array if no categories found', async () => {
      vi.spyOn(ModCategories, 'find').mockResolvedValue([] as any);

      const result = await checkIfCategoryExists(['does-not-exist']);

      expect(result).toEqual([]);
    });

    it('should return only matching slugs if some exist', async () => {
      const categories = createFakeCategories();
      const validSlug = categories[1].subCategory[0].slug; // e.g. 'combine'
      const inputSlugs = [validSlug, 'invalid-slug'];

      vi.spyOn(ModCategories, 'find').mockResolvedValue(categories as any);

      const result = await checkIfCategoryExists(inputSlugs);

      expect(result).toEqual([validSlug]);
    });

    it('should throw when DB query fails', async () => {
      const error = new Error('DB error');
      vi.spyOn(ModCategories, 'find').mockRejectedValue(error);

      await expect(checkIfCategoryExists(['small', 'medium'])).rejects.toThrow(
        'DB error',
      );
    });
  });
});
