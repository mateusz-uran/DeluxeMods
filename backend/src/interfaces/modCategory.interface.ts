import { Document } from 'mongoose';

export type SubCategory = {
  name: string;
  slug: string;
};

export type Category = {
  name: string;
  subCategory: SubCategory[];
};

export type GetCategoriesResponse = Category[];

export interface ICategory extends Document {
  name: string;
  subCategory: SubCategory[];
}