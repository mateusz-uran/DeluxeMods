import bcrypt from "bcrypt";
import validator from "validator";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors/CustomError.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.utils.js";

export async function validateUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function login(email, password, rememberMe) {
  if (!password || !email)
    throw new BadRequestError("All fields must be filled.");

  const user = await User.findOne({ email })
    .select("+password")
    .populate("roles")
    .exec();

  if (!user) throw new UnauthorizedError("Invalid email or password.");

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user, rememberMe);

  return { accessToken, refreshToken, email: user.email };
}

export async function register(name, email, password) {
  if (!name || !password || !email)
    throw new BadRequestError("All fields must be filled.");

  if (!validator.isEmail(email))
    throw new BadRequestError("Given email is not valid.");

  if (!validator.isStrongPassword(password))
    throw new BadRequestError("Given password is not strong enough.");

  const userExists = await User.findOne({ email }).exec();

  if (userExists) throw new BadRequestError("User alredy exists.");

  const salt = await bcrypt.genSalt(15);
  const hash = await bcrypt.hash(password, salt);
  const userRole = await Role.findOne({ name: "REVIEWER" });

  if (!userRole) throw new NotFoundError("Role not found.");

  const createdUser = await User.create({
    name,
    email,
    password: hash,
    roles: [userRole._id],
  });

  return {
    message: "User registered with default role.",
    user: {
      name: createdUser.name,
      email: createdUser.email,
    },
  };
}

export async function updateRole(email, newRole, oldRole) {
  if (!email) throw new BadRequestError("All fields must be field.");

  const user = await User.findOne({ email }).populate("roles").exec();

  if (!user) throw new NotFoundError("User not found.");

  if (oldRole) {
    await removeUserRole(user, oldRole.toUpperCase());
  }

  if (newRole) {
    await addUserRole(user, newRole.toUpperCase());
  }

  const updatedUser = await user.save();
  await updatedUser.populate("roles");

  return {
    message: "User roles updated",
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      roles: updatedUser.roles.map((role) => role.name),
    },
  };
}

async function removeUserRole(user, roleName) {
  const roleToRemove = await Role.findOne({ name: roleName });
  if (!roleToRemove) return;

  user.roles = user.roles.filter(
    (r) => r._id.toString() !== roleToRemove._id.toString()
  );
}

async function addUserRole(user, roleName) {
  const roleToAdd = await Role.findOne({ name: roleName });

  if (!roleToAdd) {
    throw new NotFoundError(`Role '${roleName}' does not exist.`);
  }

  const alreadyHasRole = user.roles.some(
    (r) => r._id.toString() === roleToAdd._id.toString()
  );

  if (!alreadyHasRole) {
    user.roles.push(roleToAdd._id);
  }
}
