import Interview from "../models/Interview.js";
import User from "../models/User.js";
import { evaluateAnswers } from "../services/ai.service.js";
import { generateQuestions } from "../services/ai.service.js";

/**
 * @desc    Submit interview answers & get AI evaluation
 * @route   POST /api/interview/submit
 * @access  Private
 */
export const submitInterview = async (req, res) => {
  try {
    const { category, questions } = req.body;

    if (!category || !questions || questions.length === 0) {
      return res.status(400).json({
        message: "Category and questions are required",
      });
    }

    // 🔥 REAL AI EVALUATION
    const evaluation = await evaluateAnswers(questions, category);

    // Save interview
    const interview = await Interview.create({
      user: req.userId,
      category,
      questions,
      totalScore: evaluation.score,
    });

    // Update user stats
    const user = await User.findById(req.userId);
    user.points += evaluation.score;
    user.interviewsTaken += 1;
    user.level = Math.floor(user.points / 100) + 1;
    await user.save();

    res.status(201).json({
      message: "Interview submitted successfully",
      interviewId: interview._id,
      totalScore: evaluation.score,
      feedback: evaluation.rawFeedback, // ✅ REAL AI FEEDBACK
    });
  } catch (error) {
    console.error("Interview submission error:", error);
    res.status(500).json({ message: error.message });
  }
};
export const generateAIQuestions = async (req, res) => {
  try {
    const { type, difficulty, topic } = req.body;

    if (!type || !difficulty || !topic) {
      return res.status(400).json({
        message: "Type, difficulty and topic are required",
      });
    }

    const questions = await generateQuestions(type, difficulty, topic);

    if (!questions?.length) {
      return res.status(502).json({
        message: "AI generated no questions. Please try again.",
      });
    }

    res.json({
      message: "AI questions generated successfully",
      type,
      difficulty,
      topic,
      questions,
    });
  } catch (error) {
    console.error("Generate AI questions error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
