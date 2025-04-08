import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import ModCategories from "./ModCategories.js";

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
        type: mongoose.Schema.Types.ObjectId,
        ref: "ModCategories",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

modSchema.statics.createMod = async function ({
  name,
  previewPhoto,
  specification,
  categories,
}) {
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "mods/previews", allowed_formats: ["jpg", "jpeg", "png"] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(previewPhoto.buffer);
  });

  const secureUrl = uploadResult.secure_url;

  const createMod = await this.create({
    name,
    previewPhoto: secureUrl,
    specification,
    categories,
  });

  return createMod;
};

modSchema.statics.getLastTenMods = async function () {
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
  page,
  limit,
}) {
  const categories = await ModCategories.find({ subCategory: subCategory });

  if (!categories.length) {
    throw new Error(`No categories found with subCategory: ${subCategory}`);
  }

  const mods = await this.find({
    isPublished: true,
    categories: { $in: categories.map((cat) => cat._id) },
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
    const categories = await ModCategories.find({ subCategory: subCategory });

    if (categories.length > 0) {
      query.categories = { $in: categories.map((cat) => cat._id) };
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

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
