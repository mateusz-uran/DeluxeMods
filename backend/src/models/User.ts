import { model, Schema } from 'mongoose';

import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>({
  email: { required: true, type: String, unique: true },
  name: { required: true, type: String },
  password: { required: true, select: false, type: String },
  roles: [{ ref: 'Role', required: true, type: Schema.Types.ObjectId }],
});
const User = model<IUser>('User', userSchema);
export default User;
