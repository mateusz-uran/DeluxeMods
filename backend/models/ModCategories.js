import mongoose from "mongoose";
import { createSlug } from "../utils/slug.utils.js";

const categoriesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subCategory: [
    {
      name: { type: String, required: true },
      slug: { type: String, required: true },
    },
  ],
});

categoriesSchema.statics.allCategories = async function () {
  const categories = await this.find().select("-_id name subCategory.name");

  return categories.map((cat) => ({
    categoryName: cat.name,
    subCategory: cat.subCategory.map((sub) => ({
      name: sub.name,
      slug: createSlug(sub.name),
    })),
  }));
};

const ModCategories = mongoose.model("ModCategories", categoriesSchema);
export default ModCategories;
