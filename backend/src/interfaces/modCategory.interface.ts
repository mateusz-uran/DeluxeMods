import { Document } from 'mongoose';

export type GetCategoriesResponse = {
  name: string;
  subCategory: {
    name: string;
    slug: string;
  }[];
}[];

export interface ICategory extends Document {
  name: string;
  subCategory: {
    name: string;
    slug: string;
  }[];
}
