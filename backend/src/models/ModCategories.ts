import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/modCategory.interface';

const categoriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  subCategory: [
    {
      name: { type: String, required: true },
      slug: { type: String, required: true },
    },
  ],
});

const ModCategories = mongoose.model<ICategory>(
  'ModCategories',
  categoriesSchema,
);
export default ModCategories;
