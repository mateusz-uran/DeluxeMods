import {
  GetPerSixModsInput,
  GetPerSixModsOutput,
  CreateModInput,
  CreateModOutput,
  ChangeModStatusInput,
  ChangeModStatusOutput,
} from '../interfaces/mod.interface';
import Mod from '../models/Mod';
import {
  replaceImage,
  uploadImageToCloudinary,
} from '../utils/cloudinary.util.js';
import { BadRequestError, NotFoundError } from '../utils/errors/HttpError';
import { createSlugFromTwoTexts } from '../utils/slug.utils';
import { checkIfCategoryExists } from './modCategories.service.js';

export async function getPerSixMods({
  subCategory = null,
  page = 1,
}: GetPerSixModsInput): Promise<GetPerSixModsOutput> {
  const limit = 6;

  const query: Record<string, any> = { isPublished: true };

  if (subCategory) {
    query.categories = { $in: [subCategory] };
  }

  const [mods, totalCount] = await Promise.all([
    Mod.find(query)
      .select('-_id name previewPhoto specification.modAuthor isDeluxe slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(),
    Mod.countDocuments(query),
  ]);

  return { mods, totalCount };
}

export async function createModWithPreviewPhoto(
  { name, previewPhoto, specification, categorySlugs }: CreateModInput,
  uploadImage = uploadImageToCloudinary,
  checkCategories = checkIfCategoryExists,
  createSlugForMod = createSlugFromTwoTexts,
): Promise<CreateModOutput> {
  const previewPhotoUrl = await uploadImage(previewPhoto.buffer);

  const validateCategories = await checkCategories(categorySlugs);

  if (!validateCategories.length) {
    throw new BadRequestError(
      'No valid subCategory slugs found for provided slugs.',
      undefined,
      true,
    );
  }

  const modSlug = createSlugForMod(name, specification.modAuthor);

  return Mod.create({
    name,
    previewPhoto: previewPhotoUrl,
    specification,
    categories: validateCategories,
    slug: modSlug,
  });
}

export async function changeModStatus({
  slug,
  isPublished,
  isDeluxe,
}: ChangeModStatusInput): Promise<ChangeModStatusOutput> {
  const update: Partial<{ isPublished: boolean; isDeluxe: boolean }> = {};

  if (typeof isPublished === 'boolean') update.isPublished = isPublished;
  if (typeof isDeluxe === 'boolean') update.isDeluxe = isDeluxe;

  if (Object.keys(update).length === 0) {
    throw new BadRequestError(
      'At least one of isPublished or isDeluxe must be provided.',
      undefined,
      true,
    );
  }

  const fieldsToSelect = ['slug', 'name'];
  if (isPublished !== undefined) fieldsToSelect.push('isPublished');
  if (isDeluxe !== undefined) fieldsToSelect.push('isDeluxe');

  const updated = await Mod.findOneAndUpdate({ slug }, update, {
    new: true,
  })
    .select(fieldsToSelect.join(' '))
    .lean();

  if (!updated) {
    throw new NotFoundError(
      'Mod with given slug not found.',
      { slug: slug },
      true,
    );
  }

  return updated as ChangeModStatusOutput;
}

export async function replacePreviewPhoto(
  {
    modId,
    newPreviewPhoto,
  }: { modId: string; newPreviewPhoto: Express.Multer.File },
  findMod = findModById,
  reuoploadImage = replaceImage,
) {
  const mod = await findMod(modId);
  const newUrl = await reuoploadImage(mod.previewPhoto, newPreviewPhoto.buffer);
  mod.previewPhoto = newUrl;
  await mod.save();
  return { _id: mod._id, previewPhotoUrl: mod.previewPhoto };
}

export async function checkIfModExists(id: string): Promise<boolean> {
  return !!(await Mod.exists({ _id: id }));
}

export async function updateModReviewId(
  modId: string,
  reviewId: string,
): Promise<void> {
  await Mod.findOneAndUpdate({ _id: modId }, { reviewId }, { new: true });
}

async function findModById(_id: string) {
  const mod = await Mod.findById(_id);
  if (!mod)
    throw new NotFoundError(
      'Mod with given id not found.',
      { modId: _id },
      true,
    );
  return mod;
}
