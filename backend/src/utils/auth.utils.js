
import jwt from "jsonwebtoken";

export const createAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      roles: user.roles.map(r => r.name),
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const createRefreshToken = (user, rememberMe = false) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: rememberMe ? "30d" : "1d" }
  );
};