import express from "express";
import { authorize } from "../middleware/authorize.js";
import { saveMod, saveReviewWithMod } from "../controller/review.controller.js";
import multerUpload from "../middleware/multer.js";

const router = express.Router();

router.post("/save-mod", authorize(["ADD_REVIEW"]), saveMod);
router.post(
  "/save-review",
  multerUpload,
  authorize(["ADD_REVIEW"]),
  saveReviewWithMod
);

export default router;
