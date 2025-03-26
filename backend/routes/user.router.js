import express from "express"
import { getUser, registerUser } from "../controller/user.controller.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/users", authorize(["ADD_REVIEW"]), getUser);
router.post("/register-user", authorize(["ADD_USER"]), registerUser);
// let user change name / password / mail
// delete user

export default router;