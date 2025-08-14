import { model, Schema } from 'mongoose';

import { ICategory } from '../interfaces/modCategory.interface';

const categoriesSchema = new Schema<ICategory>({
  name: { required: true, type: String, unique: true },
  subCategory: [
    {
      name: { required: true, type: String },
      slug: { required: true, type: String },
    },
  ],
});

const ModCategories = model<ICategory>('ModCategories', categoriesSchema);
export default ModCategories;
