import express from "express";
import { authorize } from "../middleware/authorize";
import { saveMod } from "../controller/mod.controller";

const router = express.Router();

router.post("/save-mod", authorize(["ADD_REVIEW"]), saveMod);

export default router;
