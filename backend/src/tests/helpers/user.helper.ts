import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config/env';
import { IUser } from '../../interfaces/user.interface';
import Role from '../../models/Role';
import User from '../../models/User';
import { Types } from 'mongoose';

export interface CreateUserOutput {
  accessToken: string;
  cookies: string[];
  email: string;
  name: string;
  refreshToken: string;
  role: string;
  userId: Types.ObjectId;
}

interface CreateUser {
  email?: string;
  name?: string;
  password?: string;
  roleName?: string;
}

type CreateUserInput = CreateUser | CreateUser[];

export const createTestUserWithRole = async (
  input: CreateUserInput = {},
): Promise<CreateUserOutput[]> => {
  const usersToCreate = Array.isArray(input) ? input : [input];
  const results: CreateUserOutput[] = [];

  for (const {
    email = faker.internet.email(),
    name = faker.internet.username(),
    password = 'StrongPassword_123',
    roleName = 'REVIEWER',
  } of usersToCreate) {
    const role = await Role.findOne({ name: roleName });

    if (!role)
      throw new Error(`Role ${roleName} not found. Use createTestRole first.`);

    const hashedPassword = await bcrypt.hash(password, 2);

    const user: IUser = await User.create({
      email,
      name,
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
      accessToken,
      cookies,
      email: user.email,
      name: user.name,
      refreshToken,
      role: role.name,
      userId: user._id
    });
  }

  return results;
};
