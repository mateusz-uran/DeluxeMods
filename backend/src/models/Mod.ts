import { Schema, Types, model } from 'mongoose';
import { IMod } from '../interfaces/mod.interface';

const modSchema = new Schema<IMod>(
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
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const Mod = model<IMod>('Mod', modSchema);
export default Mod;
