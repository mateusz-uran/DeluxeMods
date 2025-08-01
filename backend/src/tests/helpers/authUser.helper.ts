import config from '../../config/env';
import { IRole, IUser } from '../../interfaces/user.interface';
import Role from '../../models/Role';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface CreateTestUserOptions {
  name?: string;
  email?: string;
  password?: string;
  roleName?: string;
  permissions?: string[];
}

export const createTestUserWithRole = async ({
  name = 'Test User',
  email = 'test@example.com',
  password = 'password123',
  roleName = 'testRole',
  permissions = [],
}: CreateTestUserOptions = {}) => {
  const role =
    (await Role.findOne({ name: roleName })) ??
    (await Role.create({ name: roleName, permissions }));

  const hashedPassword = await bcrypt.hash(password, 10);

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

  return {
    user,
    role,
    accessToken,
    refreshToken,
    cookies,
  };
};
