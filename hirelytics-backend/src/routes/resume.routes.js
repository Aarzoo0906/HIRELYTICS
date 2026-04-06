import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  analyzeResume,
  improveResume,
  buildResume,
} from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeResume);
router.post("/improve", authMiddleware, improveResume);
router.post("/build", authMiddleware, buildResume);

export default router;
