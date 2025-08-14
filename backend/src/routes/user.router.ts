import express from 'express';

import { registerUser, updateUserRole } from '../controller/user.controller';
import { cookieAuthorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validate';
import { registerSchema, updateRoleSchema } from '../schemas/userSchema';

const router = express.Router();

router.post(
  '/register-user',
  validateRequest(registerSchema),
  cookieAuthorize(['ADD_USER']),
  registerUser,
);

router.post(
  '/update-role',
  validateRequest(updateRoleSchema),
  cookieAuthorize(['UPDATE_USER']),
  updateUserRole,
);

export default router;
