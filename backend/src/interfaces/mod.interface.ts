import { Types } from 'mongoose';

export interface IMod {
  name: string;
  previewPhoto: string;
  specification: { link: string; modAuthor: string };
  isPublished: boolean;
  isDeluxe: boolean;
  categories: string[];
  slug: string;
  reviewId?: Types.ObjectId;
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
