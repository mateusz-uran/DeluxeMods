import { Document, Types } from 'mongoose';

export enum STATUS_TYPES {
  CREATED = 'CREATED',
  REVIEWED = 'REVIEWED',
  DECLINED = 'DECLINED',
  UPDATED = 'UPDATED',
}

export interface IReview extends Document<Types.ObjectId> {
  author: Types.ObjectId;
  text: string;
  status: STATUS_TYPES;
  slug: string;
}

export type CreateReviewInput = {
  userId: string;
  text: string;
  modId: string;
};

export type CreateRevieOutput = {
  author: Types.ObjectId;
  text: string;
  status: STATUS_TYPES;
  slug: string;
}
