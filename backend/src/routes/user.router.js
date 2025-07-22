import express from "express";
import {
  getUser,
  registerUser,
  updateUserRole,
} from "../controller/user.controller.js";
import { cookieAuthorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/users", cookieAuthorize(["READ_USERS"]), getUser);
router.post("/register-user", cookieAuthorize(["ADD_USER"]), registerUser);
router.post("/update-role", cookieAuthorize(["UPDATE_USER"]), updateUserRole);

export default router;
