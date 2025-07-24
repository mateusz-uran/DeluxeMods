type SubCategory = {
  name: string;
  slug: string;
};

type Category = {
  categoryName: string;
  subCategory: SubCategory[];
};

type CategoryResponse = Category[];
