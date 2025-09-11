import { Document, Types } from 'mongoose';

export enum STATUS_TYPES {
  CREATED = 'CREATED',
  DECLINED = 'DECLINED',
  REVIEWED = 'REVIEWED',
  UPDATED = 'UPDATED',
}

export interface CreateRevieOutput {
  author: Types.ObjectId;
  slug: string;
  status: STATUS_TYPES;
  text: string;
}

export interface CreateReviewInput {
  modId: string;
  text: string;
  userId: string;
}

export interface GetReviewWithMod {
  name: string;
  previewPhoto: string;
  isDeluxe: boolean;
  specification: {
    link: string;
    modAuthor: string;
  };
  username: string;
  slug: string;
  text: string;
}

export interface GetSingleReview {
  author: { username: string };
  slug: string;
  text: string;
}

export interface IReview extends Document<Types.ObjectId> {
  author: Types.ObjectId;
  slug: string;
  status: STATUS_TYPES;
  text: string;
}
