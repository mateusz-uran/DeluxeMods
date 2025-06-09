import User from "../models/User.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.utils.js";

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.login(email, password);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user, rememberMe);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
    });

    res.status(200).json({ message: "user login success" });
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

  return res.status(200).json({ message: "User logout!" });
};
