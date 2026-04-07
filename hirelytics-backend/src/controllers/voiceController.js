import VoiceSession from "../models/VoiceSession.js";
import User from "../models/User.js";
import {
  analyzeVoiceTranscript,
  getRandomVoiceQuestion,
} from "../utils/voiceAnalysis.js";

const BADGE_ID = "confident_speaker";
const getVoicePoints = (score = 0) => {
  if (score >= 9) return 35;
  if (score >= 8) return 28;
  if (score >= 7) return 22;
  if (score >= 6) return 16;
  return 10;
};

const PARAGRAPH_SAMPLES = [
  "Communication is one of the most important skills during an interview. A clear answer with simple language, natural pace, and relevant examples makes a strong impression on the interviewer.",
  "When discussing a project, explain the problem, your approach, and the final result. This helps the listener understand your role, your thinking process, and the value of your contribution.",
  "Confidence in speaking does not mean speaking very fast. It means presenting ideas clearly, using complete sentences, and maintaining a calm and steady tone throughout the response.",
];

const unlockConfidentSpeakerBadge = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return false;
  }

  const alreadyUnlocked = (user.achievements || []).some(
    (achievement) => achievement.id === BADGE_ID,
  );

  if (alreadyUnlocked) {
    return false;
  }

  user.achievements.push({
    id: BADGE_ID,
    name: "Confident Speaker",
    unlockedAt: new Date(),
  });

  await user.save();
  return true;
};

export const getVoiceQuestion = async (req, res) => {
  const currentQuestion = `${req.query.currentQuestion || ""}`;

  res.json({
    question: getRandomVoiceQuestion(currentQuestion),
    paragraph: PARAGRAPH_SAMPLES[Math.floor(Math.random() * PARAGRAPH_SAMPLES.length)],
  });
};

export const analyzeVoice = async (req, res) => {
  try {
    const {
      transcript,
      mode,
      questionOrParagraph,
      durationSeconds = 0,
      speechConfidence = 0,
    } = req.body;

    if (!transcript?.trim()) {
      return res.status(400).json({ message: "Transcript is required." });
    }

    if (!["paragraph", "question"].includes(mode)) {
      return res.status(400).json({ message: "Invalid voice practice mode." });
    }

    if (!questionOrParagraph?.trim()) {
      return res.status(400).json({ message: "Prompt text is required." });
    }

    const feedback = await analyzeVoiceTranscript({
      transcript,
      mode,
      questionOrParagraph,
      durationSeconds,
      speechConfidence,
    });

    const session = await VoiceSession.create({
      userId: req.userId,
      mode,
      questionOrParagraph,
      transcript: transcript.trim(),
      score: feedback.score,
      grammarFeedback: feedback.grammar,
      pronunciationFeedback: feedback.pronunciation,
      confidenceFeedback: feedback.confidence,
      detectedIssues: feedback.detectedIssues,
      suggestions: feedback.suggestions,
      fillerWordCount: feedback.metrics.fillerWordCount,
      wordsPerMinute: feedback.metrics.wordsPerMinute,
      speechConfidence: feedback.metrics.speechConfidence,
    });

    const badgeUnlocked =
      feedback.score > 8 ? await unlockConfidentSpeakerBadge(req.userId) : false;

    const user = await User.findById(req.userId);
    let pointsEarned = 0;
    if (user) {
      pointsEarned = getVoicePoints(feedback.score);
      user.totalPoints = (user.totalPoints || user.points || 0) + pointsEarned;
      user.points = user.totalPoints;
      user.currentLevelPoints = (user.currentLevelPoints || 0) + pointsEarned;
      user.level = Math.floor((user.totalPoints || 0) / 100) + 1;
      await user.save();
    }

    res.status(201).json({
      sessionId: session._id,
      feedback,
      badgeUnlocked,
      pointsEarned,
      totalPoints: user?.totalPoints || 0,
      level: user?.level || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Voice analysis failed." });
  }
};

export const getVoiceHistory = async (req, res) => {
  try {
    const sessions = await VoiceSession.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch voice history." });
  }
};
