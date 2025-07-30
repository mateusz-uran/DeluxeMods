import { Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  subCategory: Array<{
    name: string;
    slug: string;
  }>;
}

export type GetCategoriesResponse = Array<{
  name: string;
  subCategory: Array<{
    name: string;
    slug: string;
  }>;
}>;
