import { IReview } from '../../interfaces/review.interface';

export type IFakeMod = {
  name: string;
  previewPhoto: string;
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
};

export type IFakeReview = Partial<IReview>;

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
