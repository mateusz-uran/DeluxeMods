import Mod from "../models/Mod.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload.util.js";
import { createLongerSlug } from "../utils/slug.utils.js";
import { checkIfCategoryExists } from "./modCategories.service.js";

export async function getPerSixMods({ subCategory = null, page = 1 }) {
  const limit = 6;

  const query = { isPublished: true };

  if (subCategory) {
    query.categories = { $in: [subCategory] };
  }

  const [mods, totalCount] = await Promise.all([
    Mod.find(query)
      .select(
        "-_id name previewPhoto specification.modAuthor specification.isDeluxe slug"
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit),
    Mod.countDocuments({
      isPublished: true,
      ...(subCategory && { categories: subCategory }),
    }),
  ]);

  return { mods, totalCount };
}

export async function createModWithPreviewPhoto(
  { name, previewPhoto, specification, categorySlugs },
  uploadImage = uploadImageToCloudinary,
  checkCategories = checkIfCategoryExists,
  createSlug = createLongerSlug
) {
  const previewPhotoUrl = await uploadImage(previewPhoto.buffer);

  const validateCategories = await checkCategories(categorySlugs);

  if (!validateCategories.length) {
    throw new Error("No valid subCategory slugs found for provided slugs.");
  }

  const modSlug = createSlug(name, specification.modAuthor);

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
  if (typeof isPublished === "boolean") update.isPublished = isPublished;
  if (typeof isDeluxe === "boolean") update.isDeluxe = isDeluxe;

  if (Object.keys(update).length === 0) {
    throw new Error("At least one of isPublished or isDeluxe must be provided");
  }

  return await Mod.findOneAndUpdate({ slug: modSlug }, update, { new: true });
}
