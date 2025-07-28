import { model, Schema } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>({
  name: { type: String, require: true },
  password: { type: String, require: true, select: false },
  email: { type: String, require: true, unique: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role', required: true }],
});
const User = model<IUser>('User', userSchema);
export default User;
