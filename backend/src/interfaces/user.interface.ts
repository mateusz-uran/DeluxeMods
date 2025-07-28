import { Document, Types } from 'mongoose';

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  password: string;
  email: string;
  roles: (IRole | Types.ObjectId)[];
}

export interface IRole extends Document {
  name: string;
  permissions: string;
}
