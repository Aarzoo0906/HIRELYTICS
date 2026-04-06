import Interview from "../models/Interview.js";
import User from "../models/User.js";
import { evaluateAnswers } from "../services/ai.service.js";
import { generateQuestions } from "../services/ai.service.js";
import { analyzeInterviewPerformance } from "../utils/interviewScoring.js";

/**
 * @desc    Submit interview answers & get AI evaluation
 * @route   POST /api/interview/submit
 * @access  Private
 */
export const submitInterview = async (req, res) => {
  try {
    const { type, difficulty, totalScore, category, answers, totalTime, timePerQuestion, questions = [] } = req.body;

    if (!type || !category || !answers) {
      return res.status(400).json({
        message: "Type, category, and answers are required",
      });
    }

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((question, index) => ({
          id: question?.id || index + 1,
          title:
            typeof question === "string"
              ? question
              : question?.title || question?.question || `Question ${index + 1}`,
          description:
            typeof question === "string"
              ? ""
              : question?.description || "",
        }))
      : [];

    const computedAnalysis = analyzeInterviewPerformance({
      answers,
      questions: normalizedQuestions,
    });

    const fallbackEntries = Object.entries(answers).map(([index]) => ({
      id: Number(index) + 1,
      title: `Question ${Number(index) + 1}`,
      description: "",
    }));
    const questionBank = normalizedQuestions.length ? normalizedQuestions : fallbackEntries;

    const questionsArray = Object.entries(answers).map(([index, answer]) => {
      const questionIndex = parseInt(index, 10);
      const perQuestion = computedAnalysis.perQuestion?.[questionIndex];

      return {
        questionIndex,
        answer: answer || "",
        score: perQuestion?.score || 0,
        feedback: perQuestion?.feedback || "Answer reviewed.",
      };
    });

    const resolvedTotalScore =
      computedAnalysis.overallScore ||
      totalScore ||
      analyzeInterviewPerformance({ answers, questions: questionBank }).overallScore;

    // Create interview record
    const interview = await Interview.create({
      user: req.userId,
      category: category || type,
      questions: questionsArray,
      totalScore: resolvedTotalScore,
      type,
      difficulty,
      totalTime,
      timePerQuestion,
    });

    // Update interview count only. Points are awarded separately by the
    // gamification controller on the result page to avoid double-counting.
    const user = await User.findById(req.userId);
    if (user) {
      user.interviewsTaken = (user.interviewsTaken || 0) + 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Interview submitted successfully",
      interviewId: interview._id,
      totalScore: resolvedTotalScore,
      feedback: computedAnalysis.improvements?.[0] || "Interview recorded. Review your answers for improvement.",
      analysis: computedAnalysis,
      interview
    });
  } catch (error) {
    console.error("Interview submission error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
export const generateAIQuestions = async (req, res) => {
  try {
    const { type, difficulty, topic } = req.body;

    if (!type || !difficulty || !topic) {
      return res.status(400).json({
        success: false,
        message: "Type, difficulty and topic are required",
      });
    }

    console.log(`Generating questions: type=${type}, difficulty=${difficulty}, topic=${topic}`);

    const questions = await generateQuestions(type, difficulty, topic);

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.warn("No questions generated, returning fallback");
      return res.status(200).json({
        success: true,
        message: "Interview questions generated (using fallback)",
        type,
        difficulty,
        topic,
        questions: [
          `Explain ${topic} fundamentals at a ${difficulty} level and when to use them in real projects.`,
          `Describe a practical ${topic} problem you solved and the trade-offs you considered.`,
          `How would you evaluate different approaches to ${topic} in a ${type} interview setting?`,
          `Share a scenario where ${topic} failed or caused issues, and how you diagnosed and fixed it.`,
          `If you had to mentor a junior on ${topic}, what step-by-step plan would you give?`,
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: "AI questions generated successfully",
      type,
      difficulty,
      topic,
      questions,
    });
  } catch (error) {
    console.error("Generate AI questions error:", error.message);
    console.error("Full error:", error);
    
    // Return a safe response with fallback questions on any error
    const { type, difficulty, topic } = req.body || {};
    const fallbackQuestions = [
      `Explain ${topic || 'the topic'} fundamentals and when to use them in real projects.`,
      `Describe a practical problem you solved and the trade-offs you considered.`,
      `How would you evaluate different approaches in a ${type || 'technical'} interview?`,
      `Share a scenario where something failed and how you fixed it.`,
      `If you had to mentor a junior, what step-by-step plan would you give?`,
    ];

    res.status(200).json({
      success: true,
      message: "Questions generated (fallback mode)",
      type: type || "technical",
      difficulty: difficulty || "medium",
      topic: topic || "general",
      questions: fallbackQuestions,
    });
  }
};

/**
 * @desc    Get interview history for a user
 * @route   GET /api/interview/history
 * @access  Private
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    if (!interviews) {
      return res.status(404).json({
        success: false,
        message: "No interview history found",
      });
    }

    res.json({
      success: true,
      message: "Interview history retrieved successfully",
      interviews,
      totalInterviews: interviews.length,
    });
  } catch (error) {
    console.error("Get interview history error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * @desc    Get feedback for improvement based on interview performance
 * @route   GET /api/interview/feedback
 * @access  Private
 */
export const getPerformanceFeedback = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!interviews || interviews.length === 0) {
      return res.json({
        success: true,
        message: "No interviews yet. Start your first interview!",
        feedback: {
          averageScore: 0,
          trend: "N/A",
          suggestions: ["Take your first interview to get personalized feedback"],
          strengths: [],
          weaknesses: [],
        },
      });
    }

    // Calculate statistics
    const totalScore = interviews.reduce((sum, int) => sum + (int.totalScore || 0), 0);
    const averageScore = Math.round(totalScore / interviews.length);
    
    // Calculate trend
    const recentScores = interviews.slice(0, 3).map(int => int.totalScore);
    const trend = recentScores.length >= 2 
      ? recentScores[0] >= recentScores[recentScores.length - 1] 
        ? "Improving" 
        : "Needs Improvement"
      : "No Data";

    // Analyze by difficulty and type
    const byDifficulty = {};
    const byType = {};
    interviews.forEach(int => {
      const diff = int.difficulty || "unknown";
      const type = int.type || "unknown";
      
      if (!byDifficulty[diff]) byDifficulty[diff] = [];
      if (!byType[type]) byType[type] = [];
      
      byDifficulty[diff].push(int.totalScore);
      byType[type].push(int.totalScore);
    });

    // Generate suggestions
    const suggestions = [];
    if (averageScore < 50) {
      suggestions.push("💡 Practice answering questions more thoroughly and provide detailed examples");
    }
    if (averageScore < 70) {
      suggestions.push("💡 Work on clarity and conciseness in your answers");
    }
    if (averageScore >= 70 && averageScore < 85) {
      suggestions.push("💡 Try harder difficulty levels to challenge yourself");
    }
    if (averageScore >= 85) {
      suggestions.push("🎯 Excellent performance! Maintain your progress");
    }

    res.json({
      success: true,
      message: "Performance feedback generated",
      feedback: {
        averageScore,
        trend,
        totalInterviews: interviews.length,
        suggestions,
        byDifficulty: Object.entries(byDifficulty).map(([diff, scores]) => ({
          difficulty: diff,
          average: Math.round(scores.reduce((a, b) => a + b) / scores.length),
          count: scores.length,
        })),
        byType: Object.entries(byType).map(([type, scores]) => ({
          type,
          average: Math.round(scores.reduce((a, b) => a + b) / scores.length),
          count: scores.length,
        })),
      },
    });
  } catch (error) {
    console.error("Get performance feedback error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
