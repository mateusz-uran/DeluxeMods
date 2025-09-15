import { Types } from 'mongoose';
import Mod from '../../models/Mod';

export interface FakeMod {
  categories: string[];
  isDeluxe: boolean;
  isPublished: boolean;
  name: string;
  previewPhoto: string;
}

export interface FullFakeMod {
  categories: string[];
  isDeluxe: boolean;
  isPublished: boolean;
  name: string;
  previewPhoto: string;
  slug: string;
  specification: { link: string; modAuthor: string };
}

type ValueOrFactor<T> = ((index: number) => T) | T;

export function createFakeMods(
  size: number,
  isDeluxe: boolean,
  isPublished: boolean,
  subCategory: string[],
): FakeMod[] {
  return Array.from({ length: size }, (_, i) => ({
    categories: subCategory,
    isDeluxe,
    isPublished,
    name: `M${String(i)}`,
    previewPhoto: `u${String(i)}`,
  }));
}

export const createFakeModsInsideDB = (
  size: number,
  isDeluxe: ValueOrFactor<boolean>,
  isPublished: ValueOrFactor<boolean>,
  subCategory: ValueOrFactor<string[]>,
) => {
  const promises = Array.from({ length: size }, async (_, i) => {
    return await Mod.create({
      categories:
        typeof subCategory === 'function' ? subCategory(i) : subCategory,
      isDeluxe: typeof isDeluxe === 'function' ? isDeluxe(i) : isDeluxe,
      isPublished:
        typeof isPublished === 'function' ? isPublished(i) : isPublished,
      name: `Mod number ${String(i + 1)}`,
      previewPhoto: `Preview image ${String(i + 1)}`,
      reviewId: new Types.ObjectId(),
      slug: `mod-${String(i + 1)}-author-${String(i + 1)}`,
      specification: {
        link: `https://example.com/mod-${String(i + 1)}`,
        modAuthor: `Author ${String(i + 1)}`,
      },
    });
  });

  return Promise.all(promises);
};
