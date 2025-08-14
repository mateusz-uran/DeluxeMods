import { model, Schema } from 'mongoose';

import { IMod } from '../interfaces/mod.interface';

const modSchema = new Schema<IMod>(
  {
    categories: [
      {
        required: true,
        type: String,
      },
    ],
    isDeluxe: { default: false, required: true, type: Boolean },
    isPublished: { default: false, required: true, type: Boolean },
    name: { required: true, type: String },
    previewPhoto: { required: true, type: String },
    reviewId: {
      ref: 'Review',
      required: false,
      sparse: true,
      type: Schema.Types.ObjectId,
      unique: true
    },
    slug: { required: true, type: String },

    specification: {
      link: { required: true, type: String },
      modAuthor: { required: true, type: String },
    },
  },
  {
    timestamps: true,
  },
);

const Mod = model<IMod>('Mod', modSchema);
export default Mod;
