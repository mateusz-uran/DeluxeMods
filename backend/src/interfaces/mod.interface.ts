import { Types } from 'mongoose';

interface ISpecification {
  link: string;
  modAuthor: string;
}

export interface IMod {
  name: string;
  previewPhoto: string;
  specification: ISpecification;
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
  slug: string;
  reviewId?: Types.ObjectId;
}

export interface CreateModInput {
  name: string;
  previewPhoto: Express.Multer.File;
  specification: ISpecification;
  categorySlugs: string[]
}

export interface CreateModOutput {
    name: string;
    previewPhoto: string;
    specification: ISpecification;
    categories: string[];
    slug: string;
}

export interface GetPerSixModsParams {
  subCategory?: string | null;
  page?: number;
}

export interface GetPerSixModsResult {
  mods: ModPreview[];
  totalCount: number;
}

export interface ModPreview {
  name: string;
  previewPhoto: string;
  specification: {
    modAuthor: string;
  };
  isDeluxe: boolean;
  slug: string;
}
