import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { callGeminiAPI } from "./ai.service.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
  "have", "in", "into", "is", "it", "of", "on", "or", "that", "the",
  "their", "this", "to", "with", "you", "your", "will", "using", "use",
  "used", "over", "than", "such", "while", "who", "our", "were", "was",
  "about", "after", "before", "through", "across", "within", "also", "can",
  "should", "must", "need",
]);

const ACTION_VERBS = [
  "built", "created", "designed", "led", "implemented", "improved",
  "optimized", "reduced", "increased", "managed", "delivered", "developed",
  "launched", "automated", "streamlined", "collaborated", "achieved", "analyzed",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));
const normalizeWhitespace = (value = "") =>
  value.replace(/\r/g, "").replace(/\t/g, " ").replace(/\u00a0/g, " ").trim();

const extractDataUrlPayload = (dataUrl) => {
  const match = `${dataUrl}`.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid file payload. Please upload the resume again.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
};

const extractResumeTextFromBuffer = async (mimeType, buffer) => {
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    throw new Error("Only PDF, DOCX, and TXT resumes are supported.");
  }

  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("Resume file must be under 5 MB.");
  }

  if (mimeType === "text/plain") {
    return normalizeWhitespace(buffer.toString("utf8"));
  }

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return normalizeWhitespace(result.text || "");
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  const { value } = await mammoth.extractRawText({ buffer });
  return normalizeWhitespace(value || "");
};

const getTopKeywords = (value = "", limit = 15) => {
  const counts = new Map();

  for (const word of value.toLowerCase().match(/[a-z][a-z0-9+#.-]{1,}/g) || []) {
    if (STOP_WORDS.has(word) || word.length < 3) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const detectSections = (resumeText) => {
  const lower = resumeText.toLowerCase();
  return {
    summary: /(summary|objective|profile)/.test(lower),
    skills: /skills?/.test(lower),
    experience: /(experience|employment|work history)/.test(lower),
    education: /education/.test(lower),
    projects: /projects?/.test(lower),
    certifications: /(certifications?|licenses?)/.test(lower),
  };
};

const getBulletLines = (resumeText) =>
  resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line));

const computeHeuristicAnalysis = (resumeText, jobDescription, targetRole) => {
  const lower = resumeText.toLowerCase();
  const sections = detectSections(resumeText);
  const bulletLines = getBulletLines(resumeText);
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
  const hasPhone = /(?:\+\d{1,3}\s*)?(?:\(?\d{3}\)?[-.\s]*)?\d{3}[-.\s]*\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(resumeText);
  const hasGithub = /github\.com\//i.test(resumeText);
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const quantifiedBullets = bulletLines.filter((line) =>
    /(\d+%|\d+x|\d+\+|\$\d+|\d+\s*(users|clients|projects|hours|days|weeks|months|years))/i.test(line),
  ).length;
  const actionVerbHits = ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${escapeRegex(verb)}\\b`, "i").test(lower),
  ).length;

  const keywordSource = `${jobDescription || ""} ${targetRole || ""}`.trim();
  const targetKeywords = getTopKeywords(keywordSource, 12);
  const matchedKeywords = targetKeywords.filter((keyword) =>
    new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(lower),
  );
  const missingKeywords = targetKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  const contactScore = [hasEmail, hasPhone, hasLinkedIn || hasGithub].filter(Boolean).length * 33.34;
  const sectionScore =
    (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100;
  const keywordScore = targetKeywords.length
    ? (matchedKeywords.length / targetKeywords.length) * 100
    : 70;
  const impactScore = clampScore(
    quantifiedBullets * 14 + actionVerbHits * 6 + Math.min(bulletLines.length, 8) * 4,
  );
  const readabilityScore = clampScore(
    45 +
      (bulletLines.length >= 4 ? 18 : bulletLines.length * 4) +
      (wordCount >= 250 && wordCount <= 900 ? 18 : 4) +
      (wordCount > 1200 ? -12 : 0),
  );
  const atsScore = clampScore(
    sectionScore * 0.34 +
      keywordScore * 0.28 +
      readabilityScore * 0.18 +
      impactScore * 0.12 +
      contactScore * 0.08,
  );

  const atsChecks = [
    {
      label: "Email and phone present",
      passed: hasEmail && hasPhone,
      detail: hasEmail && hasPhone ? "Contact details found." : "Add clear email and phone number.",
    },
    {
      label: "Professional links included",
      passed: hasLinkedIn || hasGithub,
      detail: hasLinkedIn || hasGithub ? "Professional profile links found." : "Add LinkedIn or GitHub for credibility.",
    },
    {
      label: "Core sections detected",
      passed: sections.skills && sections.experience && sections.education,
      detail:
        sections.skills && sections.experience && sections.education
          ? "Skills, experience, and education sections detected."
          : "ATS usually expects clear Skills, Experience, and Education sections.",
    },
    {
      label: "Bullet-based experience",
      passed: bulletLines.length >= 4,
      detail:
        bulletLines.length >= 4
          ? "Experience uses bullets, which ATS and recruiters scan faster."
          : "Use concise bullet points for projects and experience.",
    },
    {
      label: "Quantified achievements",
      passed: quantifiedBullets >= 2,
      detail:
        quantifiedBullets >= 2
          ? "Resume includes measurable outcomes."
          : "Add numbers, percentages, or scale to prove impact.",
    },
  ];

  const strengths = [];
  const improvements = [];

  if (matchedKeywords.length >= Math.max(3, Math.ceil(targetKeywords.length / 2))) {
    strengths.push("Resume already aligns with several target keywords from the role.");
  } else if (targetKeywords.length) {
    improvements.push("Keyword alignment is weak for the target role or job description.");
  }
  if (quantifiedBullets >= 2) {
    strengths.push("Experience includes measurable impact, which improves recruiter trust.");
  } else {
    improvements.push("Rewrite bullets with metrics, scope, or outcome-based language.");
  }
  if (sections.projects || sections.certifications) {
    strengths.push("Supplementary sections add depth beyond basic experience.");
  } else {
    improvements.push("Projects or certifications can strengthen credibility for screening.");
  }
  if (!sections.summary) {
    improvements.push("Add a short professional summary tailored to your target role.");
  }
  if (!hasLinkedIn && !hasGithub) {
    improvements.push("Include LinkedIn or GitHub to support recruiter validation.");
  }

  return {
    atsScore,
    keywordScore: clampScore(keywordScore),
    impactScore,
    readabilityScore,
    sectionScore: clampScore(sectionScore),
    targetKeywords,
    missingKeywords,
    atsChecks,
    strengths,
    improvements,
    resumeStats: {
      wordCount,
      bulletCount: bulletLines.length,
      quantifiedBulletCount: quantifiedBullets,
      actionVerbCoverage: actionVerbHits,
    },
  };
};

const parseJsonFromModel = (rawText) => {
  const fencedMatch = rawText.match(/```json\s*([\s\S]+?)```/i);
  const candidate = fencedMatch?.[1] || rawText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain JSON.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
};

const getAIInsights = async (resumeText, jobDescription, targetRole, heuristic) => {
  const prompt = `
You are an expert ATS auditor and resume reviewer.
Analyze the resume content below as if it will be screened by a modern ATS and then reviewed by a recruiter.

Target role: ${targetRole || "Not provided"}
Job description:
${jobDescription || "Not provided"}

Heuristic scan summary:
- ATS score: ${heuristic.atsScore}
- Keyword score: ${heuristic.keywordScore}
- Impact score: ${heuristic.impactScore}
- Readability score: ${heuristic.readabilityScore}
- Section score: ${heuristic.sectionScore}
- Missing keywords: ${heuristic.missingKeywords.join(", ") || "None identified"}

Return JSON only with this shape:
{
  "summary": "string",
  "aiOverallScore": number,
  "recruiterView": "string",
  "topStrengths": ["string"],
  "topImprovements": ["string"],
  "atsRisks": ["string"],
  "missingKeywords": ["string"],
  "rewrittenBullets": [
    { "before": "string", "after": "string", "why": "string" }
  ]
}

Rules:
- Base feedback on the actual resume text.
- Be strict and practical, not motivational fluff.
- Keep rewrittenBullets concise and realistic.
- Do not use markdown fences.

Resume:
${resumeText.slice(0, 15000)}
`;

  const data = await callGeminiAPI([{ role: "user", content: prompt }], 1600, 0.3);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText.trim()) {
    throw new Error("Model returned empty resume analysis.");
  }
  return parseJsonFromModel(rawText);
};

export const analyzeResumePayload = async ({
  fileName,
  fileDataUrl,
  jobDescription = "",
  targetRole = "",
}) => {
  if (!fileName || !fileDataUrl) {
    throw new Error("Resume file is required.");
  }

  const { mimeType, buffer } = extractDataUrlPayload(fileDataUrl);
  const resumeText = await extractResumeTextFromBuffer(mimeType, buffer);

  if (!resumeText || resumeText.length < 120) {
    throw new Error("Could not extract enough text from this resume. Try a cleaner PDF/DOCX or a text-based resume.");
  }

  const heuristic = computeHeuristicAnalysis(resumeText, jobDescription, targetRole);

  let aiInsights;
  try {
    aiInsights = await getAIInsights(resumeText, jobDescription, targetRole, heuristic);
  } catch (error) {
    aiInsights = {
      summary: "AI review was unavailable, so the result is based on ATS heuristics only.",
      aiOverallScore: heuristic.atsScore,
      recruiterView: "The resume needs stronger role alignment, clearer impact, and better keyword targeting.",
      topStrengths: heuristic.strengths,
      topImprovements: heuristic.improvements,
      atsRisks: heuristic.atsChecks.filter((item) => !item.passed).map((item) => item.detail),
      missingKeywords: heuristic.missingKeywords,
      rewrittenBullets: [],
      modelFallback: true,
    };
  }

  const overallScore = clampScore(
    heuristic.atsScore * 0.65 + (Number(aiInsights.aiOverallScore) || heuristic.atsScore) * 0.35,
  );

  return {
    fileName,
    mimeType,
    overallScore,
    analysisMode: aiInsights.modelFallback ? "heuristic_fallback" : "hybrid",
    summary: aiInsights.summary,
    recruiterView: aiInsights.recruiterView,
    scores: {
      overall: overallScore,
      ats: heuristic.atsScore,
      keywordAlignment: heuristic.keywordScore,
      impact: heuristic.impactScore,
      readability: heuristic.readabilityScore,
      structure: heuristic.sectionScore,
    },
    strengths: [...new Set([...(heuristic.strengths || []), ...(aiInsights.topStrengths || [])])].slice(0, 6),
    improvements: [...new Set([...(heuristic.improvements || []), ...(aiInsights.topImprovements || [])])].slice(0, 8),
    atsRisks: [...new Set(aiInsights.atsRisks || heuristic.atsChecks.filter((item) => !item.passed).map((item) => item.detail))].slice(0, 8),
    missingKeywords: [...new Set(aiInsights.missingKeywords || heuristic.missingKeywords)].slice(0, 15),
    rewrittenBullets: (aiInsights.rewrittenBullets || []).slice(0, 4),
    atsChecks: heuristic.atsChecks,
    extractedTextPreview: resumeText.slice(0, 1800),
    resumeStats: heuristic.resumeStats,
  };
};
