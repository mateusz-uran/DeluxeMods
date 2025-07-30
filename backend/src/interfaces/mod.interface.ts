import { Document, Types } from 'mongoose';

interface ISpecification {
  link: string;
  modAuthor: string;
}

export interface IMod extends Document {
  name: string;
  previewPhoto: string;
  specification: ISpecification;
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
  slug: string;
  reviewId?: Types.ObjectId;
}

export type GetPerSixModsInput = {
  subCategory?: string | null;
  page?: number;
};

export type GetPerSixModsOutput = {
  mods: ModPreview[];
  totalCount: number;
};

export type CreateModInput = {
  name: string;
  previewPhoto: Express.Multer.File;
  specification: ISpecification;
  categorySlugs: string[];
};

export type CreateModOutput = {
  name: string;
  previewPhoto: string;
  specification: ISpecification;
  categories: string[];
  slug: string;
};

export type ChangModStatusBase = {
  slug: string;
  name: string;
};

export type ChangeModStatusInput = {
  slug: string;
  isPublished?: boolean;
  isDeluxe?: boolean;
};

export type ChangeModStatusOutput = ChangModStatusBase & {
  isPublished?: boolean;
  isDeluxe?: boolean;
};

export type ModPreview = {
  name: string;
  previewPhoto: string;
  specification: {
    modAuthor: string;
  };
  isDeluxe: boolean;
  slug: string;
}
