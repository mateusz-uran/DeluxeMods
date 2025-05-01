import express from "express";
import {
  getModsByParams,
  getModsCategorizied,
  getNotPublishedMods,
  getPublishedMods,
  toggleIsDeluxeStatus,
  updateModSpec,
  updatePreviewPhoto,
} from "../controller/mod.controller.js";
import { authorize } from "../middleware/authorize.js";
import multerUpload from "../middleware/multer.js";

const router = express.Router();

router.patch("/update/:modId", authorize(["EDIT_REVIEW"]), updateModSpec);
router.get("", getPublishedMods);
router.get(
  "/private/:page/:limit",
  authorize(["READ_ALL_REVIEWS"]),
  getNotPublishedMods
);
router.get("/:subCategory", getModsCategorizied);
router.get("/", getModsByParams);
router.patch(
  "/deluxe/:modId",
  authorize(["UPDATE_REVIEW"]),
  toggleIsDeluxeStatus
);
router.patch(
  "/update-mod/:modId",
  multerUpload,
  authorize(["UPDATE_MOD"]),
  updatePreviewPhoto
);

export default router;
