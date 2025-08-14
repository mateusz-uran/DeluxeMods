import { RequestHandler } from 'express';

import { LoginOutput } from '../interfaces/user.interface';
import { LoginValidated } from '../schemas/userSchema';
import { login } from '../service/user.service';

export const loginUser: RequestHandler = async (req, res, next) => {
  const { email, password, rememberMe } = (req.validated as LoginValidated)
    .body;
    
  try {
    const result: LoginOutput = await login(email, password, rememberMe);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      accessToken: result.accessToken,
      email: result.email,
      message: 'User logged in successfully!',
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const logoutUser: RequestHandler = (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'User logged out!' });
  } catch (error: unknown) {
    next(error);
  }
};
