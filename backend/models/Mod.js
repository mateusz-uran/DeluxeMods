import mongoose from "mongoose";

const modSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewPhoto: { type: String, required: true },
  specification: {
    isDeluxe: { type: Boolean, required: true, default: false },
    name: { type: String, required: true },
    link: { type: String, required: true },
    authorName: { type: String, required: true },
  },
  isPublished: { type: Boolean, required: true, default: false },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModCategories",
      required: true,
    },
  ],
});

modSchema.statics.createMod = async function (mod) {
  const { name, previewPhoto, specification, categoryId } = mod;

  // get previewPhoto url passed by user and upload to cloudinary
  // create Mod object with given data
  // save Mod in databse and return result
};

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
