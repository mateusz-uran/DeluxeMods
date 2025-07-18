import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors/HttpError.js";

const roleCache = new Map();

const fetchPermissions = async (roleName) => {
  if (roleCache.has(roleName)) {
    return roleCache.get(roleName);
  }

  const role = await Role.findOne({ name: roleName }).lean();
  if (!role) {
    return [];
  }

  roleCache.set(roleName, role.permissions);
  return role.permissions;
};

export const cookieAuthorize =
  (requiredPermissions) => async (req, res, next) => {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    const refreshToken = req.cookies.refreshToken;

    if (!token) {
      throw new UnauthorizedError();
    }

    try {
      const decodedAccessToken = jwt.verify(token, process.env.TOKEN_SECRET);

      const allPermissions = new Set();
      for (const roleName of decodedAccessToken.roles) {
        const permissions = await fetchPermissions(roleName);
        permissions.forEach((p) => allPermissions.add(p));
      }

      const hasPermission = requiredPermissions.some((p) =>
        allPermissions.has(p)
      );

      if (!hasPermission) {
        throw new ForbiddenError();
      }

      req.user = decodedAccessToken;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError" && refreshToken) {
        try {
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
          );
          const user = await User.findById(decodedRefreshToken._id).populate(
            "roles"
          );

          if (!user) {
            throw new UnauthorizedError("User not found.");
          }

          const payload = {
            _id: user._id,
            email: user.email,
            roles: user.roles.map((r) => r.name),
          };

          const newAccessToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
            expiresIn: "15m",
          });

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          req.user = payload;
          next();
        } catch (error) {
          res.clearCookie("refreshToken");
          throw new ForbiddenError("Invalid refresh token");
        }
      } else {
        console.error(`Token error: ${error.message}`);
        throw new UnauthorizedError("Invalid token");
      }
    }
  };
