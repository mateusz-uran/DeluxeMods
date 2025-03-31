import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createAccessToken } from "../controller/auth.controller.js";
import Role from "../models/Role.js";

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

export const authorize = (requiredPermissions) => async (req, res, next) => {
  const { authorization } = req.headers;
  const refreshToken = req.cookies.refreshToken;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decodedAccessToken = jwt.verify(token, process.env.TOKEN_SECRET);

    const permissions = await fetchPermissions(decodedAccessToken.role);
    const hasPermission = requiredPermissions.some((perm) =>
      permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: no permission!" });
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
          "role"
        );

        if (!user) {
          return res.status(401).json({ message: "User not found!" });
        }

        const newAccessToken = createAccessToken(user);
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);

        req.user = jwt.verify(
            newAccessToken,
            process.env.TOKEN_SECRET
          );;
        next();
      } catch (error) {
        res.clearCookie("refreshToken");
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  }
};
