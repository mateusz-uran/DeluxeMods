import { RequestHandler } from 'express';
import { login } from '../service/user.service';
import { LoginOutput } from '../interfaces/user.interface';

// TODO: add validated schemas

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const result: LoginOutput = await login(email, password, rememberMe);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
    });

    return res.status(200).json({
      message: 'User logged in successfully!',
      email: result.email,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    next(error);
  }
};

export const logoutUser: RequestHandler = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'User logged out!' });
  } catch (error: any) {
    next(error);
  }
};
