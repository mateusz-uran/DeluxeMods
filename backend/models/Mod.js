import mongoose from "mongoose";
import ModCategories from "./ModCategories.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload.util.js";

const modSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    previewPhoto: { type: String, required: true },
    specification: {
      isDeluxe: { type: Boolean, required: true, default: false },
      link: { type: String, required: true },
      modAuthor: { type: String, required: true },
    },
    isPublished: { type: Boolean, required: true, default: false },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

modSchema.statics.createMod = async function (
  { name, previewPhoto, specification, slugs },
  uploadFn = uploadImageToCloudinary
) {
  const secureUrl = await uploadFn(previewPhoto.buffer);

  const categories = await ModCategories.find({
    "subCategory.slug": { $in: slugs },
  });

  const categorySlugs = categories.flatMap((cat) =>
    cat.subCategory
      .filter((sub) => slugs.includes(sub.slug))
      .map((sub) => sub.slug)
  );

  if (categorySlugs.length === 0) {
    throw Error("No valid subCategory slugs found for provided slugs.");
  }

  const createMod = await this.create({
    name,
    previewPhoto: secureUrl,
    specification,
    categories: categorySlugs,
  });

  return createMod;
};

modSchema.statics.updateModSpecification = async function ({
  modId,
  specification,
}) {
  if (!modId) {
    throw Error("Mod id must be provided!");
  }

  const updatedMod = await this.findByIdAndUpdate(
    modId,
    {
      specification,
    },
    { new: true }
  );

  if (!updatedMod) {
    throw Error("Mod not found!");
  }

  return updatedMod;
};

modSchema.statics.getLastTenPublishedMods = async function () {
  const mods = await this.find(
    { isPublished: true },
    "name previewPhoto specification.isDeluxe"
  )
    .sort({ createdAt: -1 })
    .limit(10);
  return mods;
};

modSchema.statics.getModsNotPublishedPagingAndSorting = async function ({
  page = 1,
  limit = 10,
}) {
  const mods = await this.find({ isPublished: false })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  return mods;
};

modSchema.statics.getModsByCategorie = async function ({
  subCategory,
  page = 1,
  limit = 10,
}) {
  console.log(`slug: ${subCategory}`);

  const mods = await this.find({
    isPublished: true,
    categories: { $in: [subCategory] },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  return mods;
};

modSchema.statics.getModByParameters = async function ({
  isPublished = true,
  isDeluxe = false,
  subCategory,
  page,
  limit,
}) {
  let query = { isPublished, isDeluxe };

  if (subCategory) {
    const categories = await ModCategories.find({
      "subCategory.slug": subCategory,
    });

    if (categories.length > 0) {
      query.categories = { $in: categories.map((cat) => cat.subCategory.slug) };
    } else {
      return [];
    }
  }

  const mods = await this.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  return mods;
};

modSchema.statics.updateModDeluxeStatus = async function ({ modId }) {
  try {
    const mod = await this.findById(modId);

    if (!mod) {
      throw new Error("Mod not found!");
    }

    const updatedMod = await this.findByIdAndUpdate(
      modId,
      {
        $set: {
          "specification.isDeluxe": !mod.specification.isDeluxe,
        },
      },
      { new: true }
    );

    return updatedMod;
  } catch (error) {
    throw new Error(`Error while updating mod: ${error.message}`);
  }
};

modSchema.statics.updatePreviewPhoto = async function (
  { modId, previewPhoto },
  uploadFn = uploadImageToCloudinary
) {
  try {
    const secureUrl = await uploadFn(previewPhoto.buffer);

    const updatedMod = await this.findByIdAndUpdate(
      modId,
      {
        previewPhoto: secureUrl,
      },
      { new: true }
    );

    if (!updatedMod) {
      throw new Error("Mod not found!");
    }

    return updatedMod;
  } catch (error) {
    if (error.message === "Mod not found!") throw error;
    throw new Error(`Error while updating preview photo: ${error.message}`);
  }
};

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
