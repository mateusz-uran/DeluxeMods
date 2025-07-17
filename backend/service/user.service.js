import User from "../models/User.js";

export async function validateUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
}
