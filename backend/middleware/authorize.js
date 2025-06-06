import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { createAccessToken } from "../utils/auth.utils.js";

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
  (requriedPermissions) => async (req, res, next) => {
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
      return res.status(401).json({ message: "Unauthorized!" });
    }

    try {
      const decodedAccessToken = jwt.verify(token, process.env.TOKEN_SECRET);

      const allPermissions = [];
      for (const roleName of decodedAccessToken.roles) {
        const permissions = await fetchPermissions(roleName);
        allPermissions.push(...permissions);
      }

      const hasPermission = requriedPermissions.some((perm) =>
        allPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Frobidden: no permission!" });
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
            return res.status(401).json({ message: "User not found!" });
          }

          const newAccessToken = createAccessToken(user);

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          req.user = jwt.verify(newAccessToken, process.env.TOKEN_SECRET);
          next();
        } catch (error) {
          res.clearCookie("refreshToken");
          return res.status(403).json({ message: "Invalid refresh token" });
        }
      } else {
        console.error(`Token error: ${error.message}`);
        res.status(401).json({ message: "Invalid token" });
      }
    }
  };

// export const authorize = (requiredPermissions) => async (req, res, next) => {
//   const { authorization } = req.headers;
//   const refreshToken = req.cookies.refreshToken;

//   if (!authorization || !authorization.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized!" });
//   }

//   const token = authorization.split(" ")[1];

//   try {
//     const decodedAccessToken = jwt.verify(token, process.env.TOKEN_SECRET);

//     const allPermissions = [];
//     for (const roleName of decodedAccessToken.roles) {
//       const permissions = await fetchPermissions(roleName);
//       allPermissions.push(...permissions);
//     }

//     const hasPermission = requiredPermissions.some((perm) =>
//       allPermissions.includes(perm)
//     );

//     if (!hasPermission) {
//       return res.status(403).json({ message: "Forbidden: no permission!" });
//     }

//     req.user = decodedAccessToken;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError" && refreshToken) {
//       try {
//         const decodedRefreshToken = jwt.verify(
//           refreshToken,
//           process.env.REFRESH_SECRET
//         );
//         const user = await User.findById(decodedRefreshToken._id).populate(
//           "roles"
//         );

//         if (!user) {
//           return res.status(401).json({ message: "User not found!" });
//         }

//         const newAccessToken = createAccessToken(user);
//         res.setHeader("Authorization", `Bearer ${newAccessToken}`);

//         req.user = jwt.verify(newAccessToken, process.env.TOKEN_SECRET);
//         next();
//       } catch (error) {
//         res.clearCookie("refreshToken");
//         return res.status(403).json({ message: "Invalid refresh token" });
//       }
//     } else {
//       console.error(`Token error: ${error.message}`);

//       res.status(401).json({ message: "Invalid token" });
//     }
//   }
// };
