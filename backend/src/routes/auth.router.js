import express from "express";
import { loginUser, logoutUser } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;