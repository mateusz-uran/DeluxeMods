import ModCategories from '../../models/ModCategories';
import { createSlug } from '../../utils/slug.utils';

interface FakeCategory {
  name: string;
  subCategory: { name: string; slug: string }[];
}

const categories = [
  { name: 'Tractors', subCategory: ['Small', 'Medium', 'Big'] },
  { name: 'Harvesters', subCategory: ['Combine', 'Forage'] },
  { name: 'Vehicles', subCategory: ['Trucks', 'Car'] },
  {
    name: 'Trailers',
    subCategory: [
      'Tipper',
      'Bale trailer',
      'Animal transport',
      'Mixer wagon',
      'Slurry tank',
      'Manure spreader',
      'Spreader',
      'Forage trailer',
    ],
  },
];

export function createFakeCategories(): FakeCategory[] {
  return categories.map((cat) => ({
    name: cat.name,
    subCategory: cat.subCategory.map((sub) => ({
      name: sub,
      slug: createSlug(sub),
    })),
  }));
}

export const createFakeCategoriesInsideDB = async (
  categories: { name: string; subCategories: string[] }[],
): Promise<FakeCategory[]> => {
  return Promise.all(
    categories.map((category) =>
      ModCategories.create({
        name: category.name,
        subCategory: category.subCategories.map((subCategory) => ({
          name: subCategory,
          slug: subCategory.toLowerCase().replace(/\s+/g, '-'),
        })),
      }),
    ),
  );
};
