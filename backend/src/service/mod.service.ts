import {
  GetPerSixModsParams,
  GetPerSixModsResult,
  CreateModInput,
  CreateModOutput,
} from '../interfaces/mod.interface';
import Mod from '../models/Mod';
import {
  replaceImage,
  uploadImageToCloudinary,
} from '../utils/cloudinary.util.js';
import { BadRequestError, NotFoundError } from '../utils/errors/HttpError.js';
import { createSlugFromTwoTexts } from '../utils/slug.utils.js';
import { checkIfCategoryExists } from './modCategories.service.js';

export async function getPerSixMods({
  subCategory = null,
  page = 1,
}: GetPerSixModsParams): Promise<GetPerSixModsResult> {
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

export async function changeModStatus({ modSlug, isPublished, isDeluxe }) {
  const update = {};
  if (typeof isPublished === 'boolean') update.isPublished = isPublished;
  if (typeof isDeluxe === 'boolean') update.isDeluxe = isDeluxe;

  if (Object.keys(update).length === 0) {
    throw new BadRequestError(
      'At least one of isPublished or isDeluxe must be provided.',
    );
  }

  return await Mod.findOneAndUpdate({ slug: modSlug }, update, { new: true });
}

export async function replacePreviewPhoto(
  { previewPhotoUrl, newPreviewPhoto },
  findMod = findModByPreviewUrl,
  reuoploadImage = replaceImage,
) {
  const mod = await findMod(previewPhotoUrl);
  const newUrl = await reuoploadImage(mod.previewPhoto, newPreviewPhoto.buffer);
  mod.previewPhoto = newUrl;
  await mod.save();
  return mod;
}

export async function checkIfModExists(id) {
  return !!(await Mod.exists({ _id: id }));
}

export async function updateModReviewId(modId, reviewId) {
  return await Mod.findOneAndUpdate(
    { _id: modId },
    { reviewId },
    { new: true },
  );
}

async function findModByPreviewUrl(url) {
  const mod = await Mod.findOne({ previewPhoto: url });
  if (!mod) throw new NotFoundError('Mod not found');
  return mod;
}
