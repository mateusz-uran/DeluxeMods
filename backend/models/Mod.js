import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

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

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
