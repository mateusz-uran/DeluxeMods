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

export interface GetPerSixModsInput {
  subCategory?: string | null;
  page?: number;
}

export interface GetPerSixModsOutput {
  mods: ModPreview[];
  totalCount: number;
}

export interface CreateModInput {
  name: string;
  previewPhoto: Express.Multer.File;
  specification: ISpecification;
  categorySlugs: string[];
}

export interface CreateModOutput {
  name: string;
  previewPhoto: string;
  specification: ISpecification;
  categories: string[];
  slug: string;
}

export interface ChangModStatusBase {
    slug: string;
    name: string;
}

export interface ChangeModStatusInput {
  slug: string;
  isPublished?: boolean;
  isDeluxe?: boolean;
}

export interface ChangeModStatusOutput extends ChangModStatusBase {
    isPublished?: boolean;
    isDeluxe?: boolean;
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
