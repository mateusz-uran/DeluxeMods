import { login } from "../service/user.service.js";

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const {
    accessToken,
    refreshToken,
    email: userEmail,
  } = await login(email, password, rememberMe);

  try {
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

    res.status(200).json({
      message: "User logged in successfully!",
      email: userEmail,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ message: "User logged out!" });
};
