import express from "express";
import { getModsByParams, getModsCategorizied, getNotPublishedMods, getPublishedMods, toggleIsDeluxeStatus, updateModSpec } from "../controller/review.controller.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.patch("/update/:modId", authorize(["EDIT_REVIEW"]), updateModSpec);
router.get("", getPublishedMods);
router.get("/private/:page/:limit", authorize(["READ_ALL_REVIEWS"]), getNotPublishedMods);
router.get("/:subCategory", getModsCategorizied);
router.get("/", getModsByParams)
router.patch("/deluxe/:modId", authorize(['UPDATE_REVIEW']), toggleIsDeluxeStatus)

export default router;
