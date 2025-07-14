import User from "../models/User";

export async function validateUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
}
