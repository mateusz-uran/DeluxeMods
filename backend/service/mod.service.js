import Mod from "../models/Mod.js";

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

export async function createMod({name, previewPhoto, specification}) {

}
