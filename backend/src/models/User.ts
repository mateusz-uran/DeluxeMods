import { model, Schema } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  email: { type: String, required: true, unique: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role', required: true }],
});
const User = model<IUser>('User', userSchema);
export default User;
