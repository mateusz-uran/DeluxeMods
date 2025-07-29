import express from 'express';
import { cookieAuthorize } from '../middleware/authorize';
import multerUpload from '../middleware/multer';
import { createMod, getModsByParameter } from '../controller/mod.controller.js';
import { validateRequest } from '../middleware/validate';
import { createModBodySchema, modQuerySchema } from '../schemas/modSchema';

const router = express.Router();

router.get('/all/', validateRequest(modQuerySchema), getModsByParameter);

router.post(
  '/save',
  multerUpload,
  validateRequest(createModBodySchema),
  cookieAuthorize(['ADD_REVIEW']),
  createMod,
);

export default router;
