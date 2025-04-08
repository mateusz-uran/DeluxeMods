import express from "express";
import {
  getUser,
  registerUser,
  updateUserRole,
} from "../controller/user.controller.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/users", authorize(["READ_USERS"]), getUser);
router.post("/register-user", authorize(["ADD_USER"]), registerUser);
router.post("/update-role", authorize(["UPDATE_USER"]), updateUserRole);

export default router;
