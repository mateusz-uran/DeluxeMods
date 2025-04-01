import express from "express"
import {  getUser, registerUser } from "../controller/user.controller.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/users", authorize(["READ_USERS"]), getUser);
router.post("/register-user", authorize(["ADD_USER"]), registerUser);

export default router;