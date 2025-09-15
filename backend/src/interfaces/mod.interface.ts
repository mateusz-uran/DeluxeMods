import { Document, Types } from 'mongoose';

export interface ChangeModStatusInput {
  isDeluxe?: boolean;
  isPublished?: boolean;
  slug: string;
}

export type ChangeModStatusOutput = ChangModStatusBase & {
  isDeluxe?: boolean;
  isPublished?: boolean;
};

export interface ChangModStatusBase {
  name: string;
  slug: string;
}

export interface CreateModInput {
  categorySlugs: string[];
  name: string;
  previewPhoto: Express.Multer.File;
  specification: ISpecification;
}

export interface CreateModOutput {
  categories: string[];
  name: string;
  previewPhoto: string;
  slug: string;
  specification: ISpecification;
}

export interface GetPerSixModsInput {
  page?: number;
  subCategory?: null | string;
}

export interface GetPerSixModsOutput {
  mods: ModPreview[];
  totalCount: number;
}

export interface GetSingleModOutput {
  name: string;
  previewPhoto: string;
  isDeluxe: boolean;
  reviewId: string;
  specification: {
    link: string;
    modAuthor: string;
  };
}

export interface IMod extends Document {
  categories: string[];
  isDeluxe: boolean;
  isPublished: boolean;
  name: string;
  previewPhoto: string;
  reviewId?: Types.ObjectId;
  slug: string;
  specification: ISpecification;
}

export interface ModPreview {
  categories: string[];
  isDeluxe: boolean;
  name: string;
  previewPhoto: string;
  slug: string;
  specification: {
    modAuthor: string;
  };
}

interface ISpecification {
  link: string;
  modAuthor: string;
}
