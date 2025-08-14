import { Document, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
}

export interface IUser extends Document<Types.ObjectId> {
  email: string;
  name: string;
  password: string;
  roles: (IRole | Types.ObjectId)[];
}

export interface LoginOutput {
  accessToken: string;
  email: string;
  refreshToken: string;
}

export interface UserOutput {
  message: string;
  user: UserInformation;
}

interface UserInformation {
  email: string;
  name: string;
  roles?: string[];
}
