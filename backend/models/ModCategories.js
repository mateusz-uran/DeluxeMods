import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subCategory: [{type: String}]
});

const ModCategories = mongoose.model("ModCategories", categoriesSchema);
export default ModCategories;
