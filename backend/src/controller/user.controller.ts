import { RequestHandler } from 'express';

import { UserOutput } from '../interfaces/user.interface';
import { RegisterValidated, UpdateRoleValidated } from '../schemas/userSchema';
import { register, updateRole } from '../service/user.service';

export const registerUser: RequestHandler = async (req, res, next) => {
  const { email, name, password } = (req.validated as RegisterValidated).body;
  try {
    const user: UserOutput = await register(name, email, password);
    return res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateUserRole: RequestHandler = async (req, res, next) => {
  const { email, newRole, oldRole } = (req.validated as UpdateRoleValidated)
    .body;

  try {
    const user: UserOutput = await updateRole(email, newRole, oldRole);
    return res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};
