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
