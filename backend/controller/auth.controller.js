import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const createAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      role: user.role.name,
      permissions: user.role.permissions,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "10s" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "20s" }
  );
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ email, accessToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: true,
    maxAge: 0,
  });

  return res.status(200).json({message: "User logout!"})
};
