import express from "express";
import { cookieAuthorize } from "../middleware/authorize.js";
import multerUpload from "../middleware/multer.js";
import {
  createMod,
  fetchAllCategories,
  getModsByParameter,
} from "../controller/mod.controller.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createModBodySchema,
  modQuerySchema,
} from "../schemas/modSchema.js";

const router = express.Router();

router.get(
  "/all/",
  validateRequest({ querySchema: modQuerySchema }),
  getModsByParameter
);

router.post(
  "/save",
  multerUpload,
  validateRequest({
    bodySchema: createModBodySchema,
  }),
  cookieAuthorize(["ADD_REVIEW"]),
  createMod
);

export default router;
