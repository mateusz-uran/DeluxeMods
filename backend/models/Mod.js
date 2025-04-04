import mongoose from "mongoose";

const modSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewPhoto: { type: String, required: true },
  //   specifications: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "ModSpecification",
  //     required: true,
  //   },
  //   author: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "ModAuthor",
  //     required: true,
  //   },
  isPublished: { type: Boolean, required: true, default: false },
});

const Mod = mongoose.model("Mod", modSchema);
export default Mod;
