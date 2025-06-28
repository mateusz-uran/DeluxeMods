import mongoose from "mongoose";

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
  return await this.find().select("-_id name subCategory.name");
};

const ModCategories = mongoose.model("ModCategories", categoriesSchema);
export default ModCategories;
