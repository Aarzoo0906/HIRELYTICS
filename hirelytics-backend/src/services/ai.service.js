import dotenv from "dotenv";
dotenv.config();

/* ===============================
   MODEL CONFIGURATION
================================= */

// Primary model from env + fallback models if primary is unavailable.
const PRIMARY_HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const FALLBACK_HF_MODELS = [
  PRIMARY_HF_MODEL,
  "Qwen/Qwen2.5-7B-Instruct",
];

const headers = {
  Authorization: `Bearer ${process.env.HF_API_KEY}`,
  "Content-Type": "application/json",
};

const parseHFResponse = async (response, modelName) => {
  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        throw new Error(
          `Model '${modelName}' is not available on Hugging Face router.`
        );
      }
      throw new Error(
        `Hugging Face request failed (${response.status}): ${raw.slice(0, 180)}`
      );
    }
    throw new Error(`Invalid JSON from Hugging Face: ${raw.slice(0, 180)}`);
  }

  if (!response.ok) {
    if (response.status === 404 || response.status === 400) {
      throw new Error(
        `Model '${modelName}' is not available on Hugging Face router.`
      );
    }
    throw new Error(
      data?.error || `Hugging Face request failed (${response.status})`
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};

const callHFWithFallback = async (payload) => {
  const tried = new Set();
  const candidates = FALLBACK_HF_MODELS.filter((model) => {
    if (!model || tried.has(model)) return false;
    tried.add(model);
    return true;
  });

  let lastError = null;

  for (const model of candidates) {
    try {
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          ...payload,
        }),
      });

      const data = await parseHFResponse(response, model);
      return { data, model };
    } catch (error) {
      lastError = error;
      const message = String(error.message || "").toLowerCase();
      const retryableModelError =
        message.includes("not available") ||
        message.includes("not found") ||
        message.includes("unknown error");
      if (!retryableModelError) {
        throw error;
      }
    }
  }

  throw (
    lastError ||
    new Error("No usable Hugging Face model found. Set HF_MODEL in .env.")
  );
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
    const prompt = `
You are a professional interview question generator.

Strictly generate 5 ${difficulty} level interview questions.

Interview Type: ${type}
Topic: ${topic}

IMPORTANT RULES:
- Questions MUST be strictly related to ${topic}
- Do NOT generate generic questions
- Make them practical and scenario-based if possible
- Return ONLY numbered questions from 1 to 5
- Do NOT add explanations or extra text
`;

    const { data } = await callHFWithFallback({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.9,
    });

    const rawText = data?.choices?.[0]?.message?.content || "";

    if (!rawText.trim()) {
      throw new Error("Model returned empty generated_text");
    }

    const text = rawText.startsWith(prompt)
      ? rawText.slice(prompt.length).trim()
      : rawText.trim();

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

    const prompt = `
You are a professional interview evaluator.

Interview Type: ${type}

Evaluate the answers below.

Return:
Score: (out of 100)
Feedback: (short paragraph)

${formatted}
`;

    const { data } = await callHFWithFallback({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const feedback = data?.choices?.[0]?.message?.content || "";

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
