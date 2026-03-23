import express from "express";
import {
  submitInterview,
  generateAIQuestions
} from "../controllers/interview.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitInterview);
router.post("/generate-questions", generateAIQuestions);

export default router;