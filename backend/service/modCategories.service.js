import ModCategories from "../models/ModCategories.js";

export async function checkIfCategoryExists(subCategorySlugs) {
  const categories = await ModCategories.find({
    "subCategory.slug": { $in: subCategorySlugs },
  });

  return categories.flatMap((cat) =>
    cat.subCategory
      .filter((sub) => subCategorySlugs.includes(sub.slug))
      .map((sub) => sub.slug)
  );
}
