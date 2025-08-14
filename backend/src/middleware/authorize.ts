import type { NextFunction, Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';

import config from '../config/env';
import { IRole } from '../interfaces/user.interface';
import Role from '../models/Role';
import User from '../models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/errors/CustomError';

export interface TokenPayload extends JwtPayload {
  _id: string;
  email: string;
  roles: string[];
}

interface AuthenticatedRequest extends Request {
  cookies: {
    [key: string]: string | undefined;
    accessToken?: string;
    refreshToken?: string;
  };
  user?: TokenPayload;
}

const CACHE_TTL_MS = process.env.NODE_ENV === 'test' ? 0 : 5000;
const roleCache = new Map<string, { perms: string[]; timestamp: number }>();

const fetchPermissions = async (roleName: string): Promise<string[]> => {
  const now = Date.now();
  const cached = roleCache.get(roleName);

  if (cached && CACHE_TTL_MS > 0 && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.perms;
  }

  const role = await Role.findOne({ name: roleName }).lean<IRole>();
  const perms: string[] = role?.permissions ?? [];

  if (CACHE_TTL_MS > 0) {
    roleCache.set(roleName, { perms, timestamp: now });
  }

  return perms;
};

export const cookieAuthorize =
  (requiredPermissions: string[]) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    let token: null | string = null;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    const refreshToken = req.cookies.refreshToken;

    if (!token) {
      next(new UnauthorizedError());
      return;
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
        next(new ForbiddenError());
        return;
      }

      req.user = decodedAccessToken;
      next();
    } catch (error: unknown) {
      if (isTokenExpiredError(error) && refreshToken) {
        try {
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            config.refreshSecret,
          ) as TokenPayload;

          const user = await User.findById(decodedRefreshToken._id).populate<
            IRole[]
          >('roles');

          if (!user) {
            next(new UnauthorizedError('User not found.'));
            return;
          }

          const roles = (user.roles as IRole[]).map((r) => r.name);

          const payload: TokenPayload = {
            _id: user._id.toString(),
            email: user.email,
            roles,
          };

          const newAccessToken = jwt.sign(payload, config.tokenSecret, {
            expiresIn: '15m',
          });

          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });

          req.user = payload;
          next();
        } catch {
          res.clearCookie('refreshToken');
          next(new ForbiddenError('Invalid refresh token'));
        }
      } else if (error instanceof Error) {
        console.error(`Token error: ${error.message}`);
        next(new UnauthorizedError('Invalid token'));
      } else {
        next(new UnauthorizedError('Invalid token'));
      }
    }
  };

function isTokenExpiredError(
  err: unknown,
): err is { message: string; name: 'TokenExpiredError'; } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: unknown }).name === 'TokenExpiredError'
  );
}
