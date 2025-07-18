import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../utils/errors/HttpError.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.utils.js";

export async function validateUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function login(email, password, rememberMe) {
  if (!password || !email)
    throw new BadRequestError("All fields must be filled.");

  const user = await User.findOne({ email }).populate("roles").exec();

  if (!user) throw new UnauthorizedError("Invalid email or password.");

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user, rememberMe);

  return { accessToken, refreshToken, email: user.email };
}
