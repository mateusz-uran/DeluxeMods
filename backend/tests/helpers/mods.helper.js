export function createFakeMods(size, isDeluxe, isPublished, subCategory) {
  return Array.from({ length: size }, (_, i) => ({
    name: `M${i}`,
    previewPhoto: `u${i}`,
    isPublished,
    isDeluxe,
    categories: subCategory
  }));
}
