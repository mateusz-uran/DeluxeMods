import { faker } from '@faker-js/faker';
import { createSlugFromTwoTexts } from './slug.utils';
import { readCategories } from '../config/readJson';
import { CategoryData } from '../types/Categories';
import Mod from '../models/Mod';

const images = [
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098115/mods/previews/kueeqovxiqymuiempuue.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1756822878/mods/previews/mzzyoe47e7l0vz9htbw0.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098888/mods/previews/xvnpzolshwkfcqh0plab.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098851/mods/previews/xqs34bsdefjukbhtmgl2.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098820/mods/previews/nbcqxoyvmfviemnlwn0h.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098789/mods/previews/y72mj10rw9snwpybhu2k.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098708/mods/previews/xdfo5puyqo9q8hn8ogfa.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098650/mods/previews/zuwmlzvuhyv34thvw3gp.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098563/mods/previews/uslahapbpxrh3wbej1lu.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098513/mods/previews/ocsey5tzpdiyuhjtxhyp.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098460/mods/previews/flv8spgarhed7sktb50q.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098322/mods/previews/oxlxscktcrfkwwane7y6.jpg',
  'https://res.cloudinary.com/dtdrbpvpn/image/upload/v1751098257/mods/previews/u8umqrim2pu9d1ndlxrf.jpg',
];

export async function seedDummyData(size: number) {
  const categories: CategoryData[] = await readCategories();

  const promises = Array.from({ length: size }, async (_, i) => {
    const modName = faker.word.words(2);
    const modAuthor = faker.person.middleName();
    const modSlug = createSlugFromTwoTexts(modName, modAuthor);

    const randomImage: string =
      images[Math.floor(Math.random() * images.length)];

    const randomCategory: CategoryData =
      categories[Math.floor(Math.random() * categories.length)];

    const randomSubCategory: string =
      randomCategory.subCategory[
        Math.floor(Math.random() * randomCategory.subCategory.length)
      ];

    await Mod.create({
      name: modName,
      previewPhoto: randomImage,
      isDeluxe: faker.datatype.boolean(),
      isPublished: true,
      specification: {
        link: faker.internet.url(),
        modAuthor: modAuthor,
      },
      categories: [randomSubCategory.toLowerCase()],

      slug: modSlug,
    });
  });

  return Promise.all(promises);
}
