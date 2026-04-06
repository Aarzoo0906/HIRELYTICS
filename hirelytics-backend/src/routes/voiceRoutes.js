import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  analyzeVoice,
  getVoiceHistory,
  getVoiceQuestion,
} from "../controllers/voiceController.js";

const router = express.Router();

router.get("/question", authMiddleware, getVoiceQuestion);
router.get("/history", authMiddleware, getVoiceHistory);
router.post("/analyze", authMiddleware, analyzeVoice);

export default router;
