import { callGeminiAPI } from "../services/ai.service.js";

const FILLER_WORDS = ["um", "uh", "like", "you know", "actually", "basically"];

const SAMPLE_QUESTIONS = [
  "Tell me about yourself.",
  "Why do you want to work with our company?",
  "Describe a time you solved a difficult problem.",
  "What are your greatest strengths as a team member?",
  "How do you handle pressure during deadlines?",
  "Tell me about a project you are proud of.",
  "How do you respond to constructive feedback?",
  "Why should we hire you for this role?",
  "What is one weakness you are currently working to improve?",
  "Describe a time when you had to learn a new skill quickly.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Tell me about a time you worked successfully in a team.",
  "Describe a situation where you showed leadership.",
  "What motivates you to do your best work?",
  "How do you handle disagreement with a teammate or manager?",
  "Tell me about a failure and what you learned from it.",
  "Describe a time you had to adapt to change.",
  "What kind of work environment helps you perform best?",
  "How do you make sure your communication is clear and professional?",
  "Tell me about a time you took initiative without being asked.",
  "What are your short-term and long-term career goals?",
  "Describe a challenging academic or internship experience.",
  "How would you explain one of your technical projects to a non-technical person?",
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const countWords = (text = "") =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const detectFillerWords = (text = "") => {
  const normalized = text.toLowerCase();
  const matches = FILLER_WORDS.flatMap((word) => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "g");
    return normalized.match(regex) || [];
  });

  return {
    count: matches.length,
    words: [...new Set(matches)],
  };
};

const detectSentenceCompleteness = (text = "") => {
  const sentences = text
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!sentences.length) {
    return { completeSentences: 0, incompleteSentences: 0 };
  }

  let completeSentences = 0;
  let incompleteSentences = 0;

  sentences.forEach((sentence) => {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length >= 5) {
      completeSentences += 1;
    } else {
      incompleteSentences += 1;
    }
  });

  return { completeSentences, incompleteSentences };
};

const getConfidenceBand = (value) => {
  if (value >= 7.5) return "High";
  if (value >= 5) return "Medium";
  return "Low";
};

const getBandFeedback = (value) => (value >= 7 ? "Good" : "Needs Improvement");

const toStars = (value) => "⭐".repeat(clamp(Math.round(value), 1, 5));

const normalizeBandLabel = (value, fallback) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Number.isFinite(Number(value))) {
    return fallback(Number(value));
  }

  return fallback(0);
};

const buildFallbackAnalysis = ({
  transcript,
  durationSeconds = 0,
  speechConfidence = 0,
}) => {
  const wordCount = countWords(transcript);
  const { count: fillerWordCount, words: fillerWords } = detectFillerWords(transcript);
  const { completeSentences, incompleteSentences } =
    detectSentenceCompleteness(transcript);
  const wordsPerMinute =
    durationSeconds > 0
      ? Math.round(wordCount / Math.max(durationSeconds / 60, 0.1))
      : 0;

  const fillerPenalty = Math.min(fillerWordCount * 0.35, 2.2);
  const shortResponsePenalty = wordCount < 20 ? 1.4 : 0;
  const incompletePenalty = incompleteSentences * 0.4;
  const speechConfidenceScore = clamp((speechConfidence || 0) * 10, 0, 10);
  const pacePenalty = wordsPerMinute > 170 || (wordsPerMinute > 0 && wordsPerMinute < 90) ? 0.8 : 0;

  const grammarScore = clamp(
    8.8 - fillerPenalty - incompletePenalty - shortResponsePenalty,
    2,
    10,
  );
  const pronunciationScore = clamp(
    speechConfidenceScore || (wordsPerMinute ? 7.1 - pacePenalty : 6.5),
    2,
    10,
  );
  const confidenceScore = clamp(
    8.5 - fillerPenalty / 2 - shortResponsePenalty / 2 - pacePenalty,
    2,
    10,
  );
  const overallScore = roundToOneDecimal(
    clamp((grammarScore + pronunciationScore + confidenceScore) / 3, 0, 10),
  );

  const detectedIssues = [];
  const suggestions = [];

  if (fillerWordCount) {
    detectedIssues.push(`Detected filler words: ${fillerWords.join(", ")}`);
    suggestions.push("Pause briefly instead of using filler words such as um or uh.");
  }

  if (wordCount < 20) {
    detectedIssues.push("Response is too short to show clear communication depth.");
    suggestions.push("Try to answer with a beginning, example, and conclusion.");
  }

  if (incompleteSentences > 0) {
    detectedIssues.push("Some sentences feel incomplete or too short.");
    suggestions.push("Use full sentences to make your answer more professional.");
  }

  if (wordsPerMinute > 170) {
    detectedIssues.push("Speech speed appears too fast.");
    suggestions.push("Slow down slightly so the listener can follow every idea.");
  } else if (wordsPerMinute > 0 && wordsPerMinute < 90) {
    detectedIssues.push("Speech speed appears too slow.");
    suggestions.push("Practice speaking with a steadier pace and fewer pauses.");
  }

  if (!suggestions.length) {
    suggestions.push("Maintain this structure and keep practicing with more examples.");
  }

  return {
    score: overallScore,
    grammar: getBandFeedback(grammarScore),
    pronunciation: getBandFeedback(pronunciationScore),
    confidence: getConfidenceBand(confidenceScore),
    detectedIssues,
    suggestions,
    metrics: {
      wordCount,
      fillerWordCount,
      wordsPerMinute,
      speechConfidence: roundToOneDecimal(
        speechConfidenceScore || pronunciationScore,
      ),
    },
    gamification: {
      fluency: toStars(confidenceScore / 2),
      grammar: toStars(grammarScore / 2),
      confidence: toStars(pronunciationScore / 2),
    },
  };
};

const parseJsonFromModel = (rawText = "") => {
  const fencedMatch = rawText.match(/```json\s*([\s\S]+?)```/i);
  const candidate = fencedMatch?.[1] || rawText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Voice analysis response did not contain JSON.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
};

const getAiAnalysis = async (payload) => {
  const prompt = `
Analyze this voice-practice transcript for an interview communication exercise.
Return strict JSON with keys:
score, grammar, pronunciation, confidence, detectedIssues, suggestions.

Transcript:
${payload.transcript}

Speech confidence score from browser: ${payload.speechConfidence}
Duration seconds: ${payload.durationSeconds}
Mode: ${payload.mode}
Prompt shown to student:
${payload.questionOrParagraph}
`;

  const data = await callGeminiAPI([{ role: "user", content: prompt }], 500, 0.2);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  if (!text) {
    return null;
  }

  return parseJsonFromModel(text);
};

export const analyzeVoiceTranscript = async (payload) => {
  const fallback = buildFallbackAnalysis(payload);

  try {
    const aiAnalysis = await getAiAnalysis(payload);
    if (!aiAnalysis) {
      return fallback;
    }

    return {
      ...fallback,
      score: roundToOneDecimal(clamp(Number(aiAnalysis.score) || fallback.score, 0, 10)),
      grammar: normalizeBandLabel(aiAnalysis.grammar, getBandFeedback),
      pronunciation: normalizeBandLabel(aiAnalysis.pronunciation, getBandFeedback),
      confidence: normalizeBandLabel(aiAnalysis.confidence, getConfidenceBand),
      detectedIssues: Array.isArray(aiAnalysis.detectedIssues)
        ? aiAnalysis.detectedIssues
        : fallback.detectedIssues,
      suggestions: Array.isArray(aiAnalysis.suggestions)
        ? aiAnalysis.suggestions
        : fallback.suggestions,
    };
  } catch {
    return fallback;
  }
};

export const getRandomVoiceQuestion = (excludedQuestion = "") => {
  const normalizedExcludedQuestion = excludedQuestion.trim().toLowerCase();
  const availableQuestions = SAMPLE_QUESTIONS.filter(
    (question) => question.trim().toLowerCase() !== normalizedExcludedQuestion,
  );

  const questionPool = availableQuestions.length
    ? availableQuestions
    : SAMPLE_QUESTIONS;

  return questionPool[Math.floor(Math.random() * questionPool.length)];
};
