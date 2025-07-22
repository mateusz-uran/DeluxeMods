import mongoose from "mongoose";

const modSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    previewPhoto: { type: String, required: true },
    specification: {
      link: { type: String, required: true },
      modAuthor: { type: String, required: true },
    },
    isPublished: { type: Boolean, required: true, default: false },
    isDeluxe: { type: Boolean, required: true, default: false },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    slug: { type: String, required: true },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
