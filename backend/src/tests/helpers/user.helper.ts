import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config/env';
import Role from '../../models/Role';
import { IUser } from '../../interfaces/user.interface';
import User from '../../models/User';

type CreateUser = {
  name?: string;
  email?: string;
  password?: string;
  roleName?: string;
};

type CreateUserInput = CreateUser | CreateUser[];

export type CreateUserOutput = {
  name: string;
  email: string;
  role: string;
  cookies: string[];
  accessToken: string;
  refreshToken: string;
};

export const createTestUserWithRole = async (
  input: CreateUserInput = {},
): Promise<CreateUserOutput[]> => {
  const usersToCreate = Array.isArray(input) ? input : [input];
  const results: CreateUserOutput[] = [];

  for (const {
    name = 'TestUser',
    email = 'testUser@gmail.com',
    password = 'StrongPassword_123',
    roleName = 'REVIEWER',
  } of usersToCreate) {
    const role = await Role.findOne({ name: roleName });

    if (!role)
      throw new Error(`Role ${roleName} not found. Use createTestRole first.`);

    const hashedPassword = await bcrypt.hash(password, 2);

    const user: IUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: [role._id],
    });

    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      roles: [role.name],
    };

    const accessToken = jwt.sign(tokenPayload, config.tokenSecret, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(tokenPayload, config.refreshSecret, {
      expiresIn: '7d',
    });

    const cookies = [
      `accessToken=${accessToken}`,
      `refreshToken=${refreshToken}`,
    ];

    results.push({
      name: user.name,
      email: user.email,
      role: role.name,
      cookies,
      accessToken,
      refreshToken,
    });
  }

  return results;
};
