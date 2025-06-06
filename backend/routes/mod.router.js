import express from "express";
import { cookieAuthorize } from "../middleware/authorize.js";
import multerUpload from "../middleware/multer.js";
import {
  getModsByParams,
  getModsCategorizied,
  getNotPublishedMods,
  getPublishedMods,
  getSingleMod,
  getSingleModAndReview,
  toggleIsDeluxeStatus,
  updateModSpec,
  updatePreviewPhoto,
} from "../controller/mod.controller.js";

const router = express.Router();

router.get("/single/:modSlug", getSingleMod);
router.get("/single-mod-review/:modSlug", getSingleModAndReview);

router.patch("/update/:modId", cookieAuthorize(["EDIT_REVIEW"]), updateModSpec);

router.get("", getPublishedMods);

router.get(
  "/private/:page/:limit",
  cookieAuthorize(["READ_ALL_REVIEWS"]),
  getNotPublishedMods
);

router.get("/category/:subCategory", getModsCategorizied);

router.get("/params", getModsByParams);

router.patch(
  "/deluxe/:modId",
  cookieAuthorize(["UPDATE_REVIEW"]),
  toggleIsDeluxeStatus
);

router.patch(
  "/update-preview/:modId",
  multerUpload,
  cookieAuthorize(["UPDATE_MOD"]),
  updatePreviewPhoto
);

export default router;
