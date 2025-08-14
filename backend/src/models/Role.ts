import { model, Schema } from "mongoose";

import { IRole } from "../interfaces/user.interface";

const roleSchema = new Schema<IRole>({
  name: { required: true, type: String, unique: true },
  permissions: [{required: true, type: String}]
});

const Role = model<IRole>('Role', roleSchema)

export default Role
