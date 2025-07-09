import mongoose from "mongoose";
import ModCategories from "./ModCategories.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload.util.js";
import { createLongerSlug } from "../utils/slug.utils.js";
import Review from "./Review.js";

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
    slug: { type: String, required: true },
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

  const modSlug = createLongerSlug(name, specification.modAuthor);

  const createMod = await this.create({
    name,
    previewPhoto: secureUrl,
    specification,
    categories: categorySlugs,
    slug: modSlug,
  });

  return createMod;
};

modSchema.statics.getSingleMod = async function ({ modSlug }) {
  if (!modSlug) {
    throw Error("Mod slug must be provided!");
  }

  const mod = await this.findOne({ slug: modSlug, isPublished: true }).select(
    "-_id name specification categories"
  );
  if (!mod) {
    throw Error("Mod not found!");
  }

  return mod;
};

modSchema.statics.getSingleModWithReview = async function ({ modSlug }) {
  if (!modSlug) {
    throw Error("Mod slug must be provided!");
  }

  const mod = await this.findOne({ slug: modSlug, isPublished: true }).select(
    "_id name specification"
  );
  if (!mod) {
    throw Error("Mod not found!");
  }

  const review = await Review.findOne({ mod: mod._id })
    .select("text author")
    .populate([
      {
        path: "author",
        select: "name",
      },
    ]);

  return {
    mod: {
      name: mod.name,
      specification: mod.specification,
    },
    review: review
      ? {
          text: review.text,
          author: review.author.name,
        }
      : null,
  };
};

modSchema.statics.updateModSpecification = async function ({
  modSlug,
  specification,
}) {
  if (!modSlug) {
    throw Error("Mod slug must be provided!");
  }

  const mod = await this.findOne({ slug: modSlug }).select(
    "name specification.modAuthor"
  );
  if (!mod) {
    throw Error("Mod not found!");
  }

  const updateFields = {
    specification,
  };

  const isAuthorChanged =
    specification.modAuthor &&
    specification.modAuthor !== mod.specification.modAuthor;

  if (isAuthorChanged) {
    const updateSlug = createLongerSlug(mod.name, specification.modAuthor);
    updateFields.slug = updateSlug;
  }

  const updatedMod = await this.findByIdAndUpdate(
    mod._id,
    {
      $set: updateFields,
    },
    { new: true }
  ).select(
    "-_id name specification.isDeluxe specification.link specification.modAuthor"
  );

  if (!updatedMod) {
    throw Error("Mod not found!");
  }

  return updatedMod;
};

modSchema.statics.getLastSixPublishedModsPaging = async function ({
  page = 1,
}) {
  const limit = 6

  const [mods, totalCount] = await Promise.all([
    this.find({ isPublished: true })
      .select("-_id name previewPhoto specification.isDeluxe slug")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit),
    this.countDocuments({ isPublished: true }),
  ]);

  return { mods, totalCount };
};

modSchema.statics.getLastTenPublishedMods = async function () {
  const mods = await this.find({ isPublished: true })
    .select("-_id name previewPhoto specification.isDeluxe slug")
    .sort({ createdAt: -1 })
    .limit(10);
  return mods;
};

modSchema.statics.getModsNotPublishedPagingAndSorting = async function ({
  page = 1,
  limit = 10,
}) {
  const mods = await this.find({ isPublished: false })
    .select("-_id name previewPhoto specification.modAuthor")
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
  const mods = await this.find({
    isPublished: true,
    categories: { $in: [subCategory] },
  })
    .select(
      "-_id name previewPhoto specification.modAuthor specification.isDeluxe slug"
    )
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  return mods;
};

modSchema.statics.getModByParameters = async function ({
  isDeluxe = false,
  subCategory = [],
  page,
  limit,
}) {
  const query = {
    ...(typeof isDeluxe === "boolean" && {
      "specification.isDeluxe": isDeluxe,
    }),
    ...(subCategory.length > 0 && {
      categories: { $in: subCategory },
    }),
  };

  return this.find(query)
    .select(
      "-_id name previewPhoto specification.modAuthor specification.isDeluxe slug"
    )
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
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
    ).select("_id name specification.isDeluxe");

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
    ).select("_id name previewPhoto");

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
