import ModCategories from "../models/ModCategories.js";
import { createSlug } from "../utils/slug.utils.js";

export async function checkIfCategoryExists(subCategorySlugs) {
  console.log("Sub category slug: ", subCategorySlugs);
  
  const categories = await ModCategories.find({
    "subCategory.slug": { $in: subCategorySlugs },
  });

  return categories.flatMap((cat) =>
    cat.subCategory
      .filter((sub) => subCategorySlugs.includes(sub.slug))
      .map((sub) => sub.slug)
  );
}

export async function getAllCategories() {
  const categories = await ModCategories.find().select(
    "-_id name subCategory.name"
  );

  return categories.map((cat) => ({
    categoryName: cat.name,
    subCategory: cat.subCategory.map((sub) => ({
      name: sub.name,
      slug: createSlug(sub.name),
    })),
  }));
}
