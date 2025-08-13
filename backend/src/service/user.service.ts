import bcrypt from 'bcrypt';
import validator from 'validator';
import User from '../models/User';
import Role from '../models/Role';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors/CustomError';
import { createAccessToken, createRefreshToken } from '../utils/auth.utils';
import { Types } from 'mongoose';
import {
  IRole,
  IUser,
  LoginOutput,
  UserOutput,
} from '../interfaces/user.interface';

export async function validateUserById(
  userId: string | Types.ObjectId,
): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
  {
    accessTokenCreator = createAccessToken,
    refreshTokenCreator = createRefreshToken,
  } = {},
): Promise<LoginOutput> {
  if (!password || !email)
    throw new BadRequestError('All fields must be filled.');

  const user = await User.findOne({ email })
    .select('+password')
    .populate('roles')
    .exec();

  if (!user) throw new UnauthorizedError('Invalid email or password.');

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const accessToken = accessTokenCreator(user);
  const refreshToken = refreshTokenCreator(user, rememberMe);

  return { accessToken, refreshToken, email: user.email };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<UserOutput> {
  if (!name || !password || !email) {
    throw new BadRequestError('All fields must be filled.');
  }

  if (!validator.isEmail(email)) {
    throw new BadRequestError('Given email is not valid.');
  }

  if (!validator.isStrongPassword(password)) {
    throw new BadRequestError('Given password is not strong enough.');
  }

  const userExists = await User.findOne({ email }).exec();

  if (userExists) {
    throw new BadRequestError('User alredy exists.');
  }

  const salt = await bcrypt.genSalt(15);
  const hash = await bcrypt.hash(password, salt);
  const userRole = await Role.findOne({ name: 'REVIEWER' }).exec();

  if (!userRole) {
    throw new NotFoundError('Role not found.');
  }

  const createdUser = await User.create({
    name,
    email,
    password: hash,
    roles: [userRole._id],
  });

  return {
    message: 'User registered with default role.',
    user: {
      name: createdUser.name,
      email: createdUser.email,
    },
  };
}

// add or removes role, can do both at the same time
export async function updateRole(
  email: string,
  newRole: string,
  oldRole: string,
): Promise<UserOutput> {
  if (!email) throw new BadRequestError('All fields must be field.');

  const user = await User.findOne({ email }).populate('roles').exec();

  if (!user) throw new NotFoundError('User not found.');

  if (oldRole) {
    await removeUserRole(user, oldRole.toUpperCase());
  }

  if (newRole) {
    await addUserRole(user, newRole.toUpperCase());
  }

  const updatedUser = await user.save();
  await updatedUser.populate('roles');

  return {
    message: 'User roles updated',
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      roles: updatedUser.roles
        .filter(
          (role): role is IRole => typeof role !== 'string' && 'name' in role,
        )
        .map((role) => role.name),
    },
  };
}

function getRoleId(role: IRole | Types.ObjectId): Types.ObjectId {
  return typeof role === 'object' && '_id' in role ? role._id : role;
}

async function removeUserRole(user: IUser, roleName: string) {
  const roleToRemove = await Role.findOne({ name: roleName }).exec();
  if (!roleToRemove) return;

  user.roles = user.roles.filter(
    (r) => getRoleId(r).toString() !== roleToRemove._id.toString(),
  );
}

async function addUserRole(user: IUser, roleName: string) {
  const roleToAdd = await Role.findOne({ name: roleName });

  if (!roleToAdd) {
    throw new NotFoundError(`Role '${roleName}' does not exist.`);
  }

  const alreadyHasRole = user.roles.some(
    (r) => getRoleId(r).toString() === roleToAdd._id.toString(),
  );

  if (!alreadyHasRole) {
    user.roles.push(roleToAdd._id);
  }
}
