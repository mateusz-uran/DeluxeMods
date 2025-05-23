import express from "express";
import { authorize } from "../middleware/authorize.js";
import multerUpload from "../middleware/multer.js";
import {
  getModsByParams,
  getModsCategorizied,
  getNotPublishedMods,
  getPublishedMods,
  getSingleMod,
  toggleIsDeluxeStatus,
  updateModSpec,
  updatePreviewPhoto,
} from "../controller/mod.controller.js";

const router = express.Router();

router.get("/single/:modSlug", getSingleMod);

router.patch("/update/:modId", authorize(["EDIT_REVIEW"]), updateModSpec);

router.get("", getPublishedMods);

router.get(
  "/private/:page/:limit",
  authorize(["READ_ALL_REVIEWS"]),
  getNotPublishedMods
);

router.get("/category/:subCategory", getModsCategorizied);

router.get("/params", getModsByParams);

router.patch(
  "/deluxe/:modId",
  authorize(["UPDATE_REVIEW"]),
  toggleIsDeluxeStatus
);

router.patch(
  "/update-preview/:modId",
  multerUpload,
  authorize(["UPDATE_MOD"]),
  updatePreviewPhoto
);

export default router;
