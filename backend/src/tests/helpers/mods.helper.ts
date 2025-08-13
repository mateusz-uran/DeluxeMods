import { ICategory } from '../../interfaces/modCategory.interface';
import { IReview } from '../../interfaces/review.interface';
import Mod from '../../models/Mod';
import ModCategories from '../../models/ModCategories';

export type IFakeMod = {
  name: string;
  previewPhoto: string;
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
};

export type IFakeReview = Partial<IReview>;

export type FullFakeMod = {
  name: string;
  previewPhoto: string;
  specification: { link: string; modAuthor: string };
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
  slug: string;
};

type ValueOrFactor<T> = T | ((index: number) => T);

export const createFakeCategoriesInsideDB = async (
  categories: { name: string; subCategories: string[] }[],
): Promise<ICategory[]> => {
  return Promise.all(
    categories.map((category) =>
      ModCategories.create({
        name: category.name,
        subCategory: category.subCategories.map((subCategory, j) => ({
          name: subCategory,
          slug: `${subCategory.toLowerCase().replace(/\s+/g, '-')}`,
        })),
      }),
    ),
  );
};

export function createFakeMods(
  size: number,
  isDeluxe: boolean,
  isPublished: boolean,
  subCategory: string[],
): IFakeMod[] {
  return Array.from({ length: size }, (_, i) => ({
    name: `M${i}`,
    previewPhoto: `u${i}`,
    isPublished,
    isDeluxe,
    categories: subCategory,
  }));
}

export const createFakeModsInsideDB = (
  size: number,
  isDeluxe: ValueOrFactor<boolean>,
  isPublished: ValueOrFactor<boolean>,
  subCategory: ValueOrFactor<string[]>,
) => {
  const promises = Array.from({ length: size }, async (_, i) => {
    await Mod.create({
      name: `Mod number ${i + 1}`,
      previewPhoto: `Preview image ${i + 1}`,
      specification: {
        link: `https://example.com/mod-${i + 1}`,
        modAuthor: `Author ${i + 1}`,
      },
      isPublished:
        typeof isPublished === 'function' ? isPublished(i) : isPublished,
      isDeluxe: typeof isDeluxe === 'function' ? isDeluxe(i) : isDeluxe,
      categories:
        typeof subCategory === 'function' ? subCategory(i) : subCategory,
      slug: `mod-${i + 1}-author-${i + 1}`,
    });
  });

  return Promise.all(promises);
};
