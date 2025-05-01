import express from "express";
import { authorize } from "../middleware/authorize.js";
import {
  getLastTenReviewsWithStatusCreated,
  getTenReviewsByUser,
  getTenReviewsByUserAndStatus,
  saveReviewWithMod,
  updateReview,
  updateReviewStatus,
} from "../controller/review.controller.js";
import multerUpload from "../middleware/multer.js";

const router = express.Router();

router.post(
  "/save-review",
  multerUpload,
  authorize(["ADD_REVIEW"]),
  saveReviewWithMod
);
router.patch("/update-review/:reviewId", authorize(["EDIT_REVIEW"]), updateReview);

router.get("/get-reviews/:userId", authorize(["READ_REVIEW"]), getTenReviewsByUser)

router.get("/get-reviews/:userId/:status", authorize(["READ_REVIEW"]), getTenReviewsByUserAndStatus)

router.get("/get-reviews", authorize(["READ_ALL_REVIEWS"]), getLastTenReviewsWithStatusCreated)

router.patch("/update-review/:reviewId/:status", authorize(["UPDATE_REVIEW"]), updateReviewStatus);

export default router;
