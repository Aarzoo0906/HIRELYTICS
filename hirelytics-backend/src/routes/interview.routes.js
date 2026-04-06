import express from "express";
import {
  submitInterview,
  generateAIQuestions,
  getInterviewHistory,
  getPerformanceFeedback
} from "../controllers/interview.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitInterview);
router.post("/generate-questions", generateAIQuestions);
router.get("/history", authMiddleware, getInterviewHistory);
router.get("/feedback", authMiddleware, getPerformanceFeedback);

export default router;