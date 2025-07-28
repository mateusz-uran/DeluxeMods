import { model, Schema } from "mongoose";
import { IRole } from "../interfaces/user.interface";

const roleSchema = new Schema<IRole>({
  name: { type: String, require: true, unique: true },
  permissions: [{type: String, required: true}]
});

const Role = model<IRole>('Role', roleSchema)

export default Role
