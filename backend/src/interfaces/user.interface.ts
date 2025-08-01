import { Document, Types } from 'mongoose';

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  password: string;
  email: string;
  roles: (IRole | Types.ObjectId)[];
}

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
}

export type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

export type UserOutput = {
  message: string;
  user: UserInformation;
};

type UserInformation = {
  name: string;
  email: string;
  roles?: string[];
};
