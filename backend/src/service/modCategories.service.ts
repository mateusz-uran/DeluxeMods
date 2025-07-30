import { GetCategoriesResponse } from '../interfaces/modCategory.interface';
import ModCategories from '../models/ModCategories';

export async function checkIfCategoryExists(
  subCategorySlugs: string[],
): Promise<string[]> {
  const categories = await ModCategories.find({
    'subCategory.slug': { $in: subCategorySlugs },
  });

  return categories.flatMap((cat) =>
    cat.subCategory
      .filter((sub) => subCategorySlugs.includes(sub.slug))
      .map((sub) => sub.slug),
  );
}

export async function getAllCategories(): Promise<GetCategoriesResponse> {
  const categories = await ModCategories.find()
    .select('-_id name subCategory.name subCategory.slug')
    .lean();

  return categories.map((cat) => ({
    name: cat.name,
    subCategory: cat.subCategory.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
    })),
  }));
}
