import { RequestHandler } from 'express';
import { register, updateRole } from '../service/user.service';
import { UserOutput } from '../interfaces/user.interface';

export const registerUser: RequestHandler = async (req, res, next) => {
  const { name, email, password } = req.validated?.body;

  try {
    const user: UserOutput = await register(name, email, password);
    return res.status(201).json(user);
  } catch (error: any) {
    next(error);
  }
};

export const updateUserRole: RequestHandler = async (req, res, next) => {
  const { email, newRole, oldRole } = req.validated?.body;

  try {
    const user: UserOutput = await updateRole(email, newRole, oldRole);
    return res.status(201).json(user);
  } catch (error: any) {
    next(error);
  }
};
