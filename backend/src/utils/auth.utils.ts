import jwt from 'jsonwebtoken';
import { IRole, IUser } from '../interfaces/user.interface';
import config from '../config/env';

export const createAccessToken = (user: IUser) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      roles: user.roles
        .filter(
          (role): role is IRole => typeof role !== 'string' && 'name' in role,
        )
        .map((role) => role.name),
    },
    config.tokenSecret,
    { expiresIn: '15m' },
  );
};

export const createRefreshToken = (user: IUser, rememberMe = false) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    config.tokenSecret,
    { expiresIn: rememberMe ? '30d' : '1d' },
  );
};
