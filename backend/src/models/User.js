import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  password: { type: String, require: true, select: false },
  email: { type: String, require: true, unique: true },
  roles: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
