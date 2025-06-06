import express from "express";
import { cookieAuthorize } from "../middleware/authorize.js";
import {
  getLastTenReviewsWithStatusCreated,
  getReview,
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
  cookieAuthorize(["ADD_REVIEW"]),
  saveReviewWithMod
);

router.get("/get-review/:reviewSlug", getReview);

router.patch(
  "/update-review/:reviewId",
  cookieAuthorize(["EDIT_REVIEW"]),
  updateReview
);

router.get(
  "/get-reviews/:userId",
  cookieAuthorize(["READ_REVIEW"]),
  getTenReviewsByUser
);

router.get(
  "/get-reviews/:userId/:status",
  cookieAuthorize(["READ_REVIEW"]),
  getTenReviewsByUserAndStatus
);

router.get(
  "/get-reviews",
  cookieAuthorize(["READ_ALL_REVIEWS"]),
  getLastTenReviewsWithStatusCreated
);

router.patch(
  "/update-review/:reviewId/:status",
  cookieAuthorize(["UPDATE_REVIEW"]),
  updateReviewStatus
);

export default router;
