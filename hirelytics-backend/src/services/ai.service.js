import dotenv from "dotenv";
dotenv.config();

/* ===============================
   MODEL CONFIGURATION
================================= */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "models/gemini-2.5-flash-lite"; // Using Lite version for better performance

if (!GEMINI_API_KEY) {
  console.warn("⚠️  WARNING: GEMINI_API_KEY is not set. Using fallback questions for interviews.");
}

const parseGeminiResponse = async (response) => {
  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    if (!response.ok) {
      throw new Error(
        `Gemini API request failed (${response.status}): ${raw.slice(0, 180)}`
      );
    }
    throw new Error(`Invalid JSON from Gemini: ${raw.slice(0, 180)}`);
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini API request failed (${response.status})`
    );
  }

  if (data?.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return data;
};

export const callGeminiAPI = async (
  messages,
  maxTokens = 1000,
  temperature = 0.7,
) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Fallback questions will be used.");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: temperature,
            topP: 0.95,
            topK: 64,
          },
        }),
      }
    );

    const data = await parseGeminiResponse(response);
    return data;
  } catch (error) {
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
};

const buildLocalFallbackQuestions = (type, difficulty, topic) => {
  const levelHint = {
    easy: "at a beginner level",
    medium: "at an intermediate level",
    hard: "at an advanced level",
  }[difficulty] || "at an intermediate level";

  const kind = type === "technical" ? "technical" : "behavioral";

  return [
    `Explain ${topic} fundamentals ${levelHint} and when to use them in real projects.`,
    `Describe a practical ${topic} problem you solved and the trade-offs you considered.`,
    `How would you evaluate different approaches to ${topic} in a ${kind} interview setting?`,
    `Share a scenario where ${topic} failed or caused issues, and how you diagnosed and fixed it.`,
    `If you had to mentor a junior on ${topic}, what step-by-step plan would you give?`,
  ];
};

/* ===============================
   GENERATE AI QUESTIONS
================================= */
export const generateQuestions = async (type, difficulty, topic) => {
  try {
    const prompt = `Generate 5 ${difficulty} level ${type} interview questions about ${topic}. 
Return ONLY numbered questions from 1 to 5, one per line. No explanations.`;

    const data = await callGeminiAPI(
      [{ role: "user", content: prompt }],
      800,
      0.9
    );

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText.trim()) {
      throw new Error("Model returned empty response");
    }

    const text = rawText.trim();

    // Support common list formats: "1. ...", "1) ...", "- ..."
    const parsed = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, ""))
      .filter((line) => line.length >= 10);

    // Remove duplicates and return max 5 questions.
    const questions = [...new Set(parsed)].slice(0, 5);

    if (questions.length === 0) {
      throw new Error("Could not parse questions from model output");
    }

    return questions;
  } catch (error) {
    console.log("AI QUESTION ERROR:", error.message);
    return buildLocalFallbackQuestions(type, difficulty, topic);
  }
};

/* ===============================
   EVALUATE ANSWERS
================================= */
export const evaluateAnswers = async (questions, type) => {
  try {
    const formatted = questions
      .map((q, i) => `Question ${i + 1}: ${q.question}\nAnswer: ${q.answer}`)
      .join("\n\n");

    const prompt = `You are a professional interview evaluator.

Interview Type: ${type}

Evaluate the answers below.

Return:
Score: (out of 100)
Feedback: (short paragraph)

${formatted}`;

    const data = await callGeminiAPI(
      [{ role: "user", content: prompt }],
      300,
      0.7
    );

    const feedback = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract score from text (basic parsing)
    const scoreMatch = feedback.match(/(\d{1,3})/);
    const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 60;

    return {
      score,
      rawFeedback: feedback,
    };
  } catch (error) {
    console.log("AI EVALUATION ERROR:", error.message);

    return {
      score: 50,
      rawFeedback: "AI evaluation temporarily unavailable.",
    };
  }
};
