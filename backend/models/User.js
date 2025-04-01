import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import Role from "./Role.js";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  password: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }],
});

userSchema.statics.register = async function (name, email, password) {
  if (!name || !password || !email) {
    throw Error("All field must be filled!");
  }

  if (!validator.isEmail(email)) {
    throw Error("Given email is valid!");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Given password is not strong enough!");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error(`Email ${email} already in use!`);
  }

  const salt = await bcrypt.genSalt(15);
  const hash = await bcrypt.hash(password, salt);
  const userRole = await Role.findOne({ name: "REVIEWER" });

  if (!userRole) {
    throw Error('Role REVIEWER not found');
  }

  const user = await this.create({
    name,
    email,
    password: hash,
    roles: [userRole._id],
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!password || !email) {
    throw Error("All field must be filled!");
  }

  const user = await this.findOne({ email }).populate("roles").exec();

  if (!user) {
    throw Error(`Email ${email} is incorrect!`);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password!");
  }

  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
