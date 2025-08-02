import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';
import { ForbiddenError, UnauthorizedError } from '../utils/errors/CustomError';
import type { NextFunction, Request, Response } from 'express';
import config from '../config/env';

export interface TokenPayload extends JwtPayload {
  _id: string;
  email: string;
  roles: string[];
}

const CACHE_TTL_MS = process.env.NODE_ENV === 'test' ? 0 : 5000;
const roleCache = new Map<string, { perms: string[]; timestamp: number }>();

const fetchPermissions = async (roleName: string): Promise<string[]> => {
  const now = Date.now();
  const cached = roleCache.get(roleName);

  if (cached && CACHE_TTL_MS > 0 && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.perms;
  }

  const role = await Role.findOne({ name: roleName }).lean();
  const perms = role?.permissions ?? [];

  if (CACHE_TTL_MS > 0) {
    roleCache.set(roleName, { perms, timestamp: now });
  }

  return perms;
};

export const cookieAuthorize =
  (requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | null = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    const refreshToken = req.cookies.refreshToken;

    if (!token) {
      return next(new UnauthorizedError());
    }

    try {
      const decodedAccessToken = jwt.verify(
        token,
        config.tokenSecret,
      ) as TokenPayload;

      const allPermissions = new Set<string>();
      for (const roleName of decodedAccessToken.roles) {
        const permissions = await fetchPermissions(roleName);
        permissions.forEach((p) => allPermissions.add(p));
      }

      const hasPermission = requiredPermissions.some((p) =>
        allPermissions.has(p),
      );

      if (!hasPermission) {
        return next(new ForbiddenError());
      }

      req.user = decodedAccessToken;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError' && refreshToken) {
        try {
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            config.refreshSecret,
          ) as TokenPayload;
          const user = await User.findById(decodedRefreshToken._id).populate(
            'roles',
          );

          if (!user) {
            return next(new UnauthorizedError('User not found.'));
          }

          const payload: TokenPayload = {
            _id: user._id.toString(),
            email: user.email,
            roles: user.roles.map((r: any) => r.name),
          };

          const newAccessToken = jwt.sign(payload, config.tokenSecret, {
            expiresIn: '15m',
          });

          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          req.user = payload;
          next();
        } catch (error) {
          res.clearCookie('refreshToken');
          return next(new ForbiddenError('Invalid refresh token'));
        }
      } else {
        console.error(`Token error: ${error.message}`);
        return next(new UnauthorizedError('Invalid token'));
      }
    }
  };
