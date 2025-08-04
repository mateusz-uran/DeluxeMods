import { IReview } from '../../interfaces/review.interface';
import Mod from '../../models/Mod';

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

export const createFakeModsInsideMemoryDB = async (
  size: number,
  isDeluxe: ValueOrFactor<boolean>,
  isPublished: ValueOrFactor<boolean>,
  subCategory: ValueOrFactor<string[]>,
): Promise<any> => {
  const mods = Array.from({ length: size }, (_, i) => ({
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
    slug: `mod[${i + 1}]createby[${i + 1}]`,
  }));

  return await Mod.insertMany(mods);
};

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
