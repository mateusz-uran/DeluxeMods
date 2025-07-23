export interface IFakeMod {
  name: string;
  previewPhoto: string;
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
}

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
