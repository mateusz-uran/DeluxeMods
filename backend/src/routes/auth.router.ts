import express from "express";

import { loginUser, logoutUser } from "../controller/auth.controller";
import { validateRequest } from "../middleware/validate";
import { loginSchema } from "../schemas/userSchema";

const router = express.Router();

router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", logoutUser);

export default router;