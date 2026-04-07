import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { callGeminiAPI, getAIServiceStatus } from "./ai.service.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "in", "into", "is", "it", "of", "on", "or", "that", "the", "their", "this",
  "to", "with", "you", "your", "will", "using", "use", "used", "over", "than",
  "such", "while", "who", "our", "were", "was", "about", "after", "before",
  "through", "across", "within", "also", "can", "should", "must", "need",
]);

const ACTION_VERBS = [
  "built", "created", "designed", "led", "implemented", "improved", "optimized",
  "reduced", "increased", "managed", "delivered", "developed", "launched",
  "automated", "streamlined", "collaborated", "achieved", "analyzed",
];

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));
const dedupe = (values = []) => [...new Set(values.filter(Boolean))];
const normalizeWhitespace = (value = "") =>
  value.replace(/\r/g, "").replace(/\t/g, " ").replace(/\u00a0/g, " ").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const extractResumeText = async ({ fileDataUrl, resumeText }) => {
  if (resumeText?.trim()) return normalizeWhitespace(resumeText);
  if (!fileDataUrl) throw new Error("Resume text or file is required.");
  const { mimeType, buffer } = extractDataUrlPayload(fileDataUrl);
  return extractResumeTextFromBuffer(mimeType, buffer);
};

const getTopKeywords = (value = "", limit = 16) => {
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

const parseJsonFromModel = (rawText) => {
  const fencedMatch = rawText.match(/```json\s*([\s\S]+?)```/i);
  const candidate = fencedMatch?.[1] || rawText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain JSON.");
  }
  const jsonText = candidate.slice(start, end + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    const repaired = jsonText
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');

    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Model JSON parsing failed: ${error.message}`);
    }
  }
};

const normalizeResumeField = (value = "") =>
  Array.isArray(value)
    ? value.filter(Boolean).join("\n")
    : `${value || ""}`.trim();

const normalizeStructuredResume = (structuredResume = {}, fallback = {}) => ({
  fullName: normalizeResumeField(structuredResume.fullName || fallback.fullName),
  email: normalizeResumeField(structuredResume.email || fallback.email),
  phone: normalizeResumeField(structuredResume.phone || fallback.phone),
  location: normalizeResumeField(structuredResume.location || fallback.location),
  linkedin: normalizeResumeField(structuredResume.linkedin || fallback.linkedin),
  github: normalizeResumeField(structuredResume.github || fallback.github),
  currentTitle: normalizeResumeField(
    structuredResume.currentTitle || fallback.currentTitle,
  ),
  yearsExperience: normalizeResumeField(
    structuredResume.yearsExperience || fallback.yearsExperience,
  ),
  targetRole: normalizeResumeField(structuredResume.targetRole || fallback.targetRole),
  summary: normalizeResumeField(structuredResume.summary || fallback.summary),
  skills: normalizeResumeField(structuredResume.skills || fallback.skills),
  experience: normalizeResumeField(
    structuredResume.experience || fallback.experience,
  ),
  internships: normalizeResumeField(
    structuredResume.internships || fallback.internships,
  ),
  projects: normalizeResumeField(structuredResume.projects || fallback.projects),
  leadership: normalizeResumeField(
    structuredResume.leadership || fallback.leadership,
  ),
  education: normalizeResumeField(structuredResume.education || fallback.education),
  certifications: normalizeResumeField(
    structuredResume.certifications || fallback.certifications,
  ),
  achievements: normalizeResumeField(
    structuredResume.achievements || fallback.achievements,
  ),
});

const splitInputLines = (value = "") =>
  `${value || ""}`
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const splitSkillValues = (value = "") =>
  `${value || ""}`
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatBulletBlock = (value = "") =>
  splitInputLines(value)
    .map((line) => (line.startsWith("-") ? line : `- ${line}`))
    .join("\n");

const buildPlainTextFromStructuredResume = (structuredResume = {}) => {
  const sections = [
    ["SUMMARY", normalizeResumeField(structuredResume.summary)],
    ["SKILLS", splitSkillValues(structuredResume.skills).join(", ")],
    ["EXPERIENCE", formatBulletBlock(structuredResume.experience)],
    ["INTERNSHIPS", formatBulletBlock(structuredResume.internships)],
    ["PROJECTS", formatBulletBlock(structuredResume.projects)],
    ["LEADERSHIP", formatBulletBlock(structuredResume.leadership)],
    ["EDUCATION", normalizeResumeField(structuredResume.education)],
    ["CERTIFICATIONS", normalizeResumeField(structuredResume.certifications)],
    ["ACHIEVEMENTS", formatBulletBlock(structuredResume.achievements)],
  ].filter(([, content]) => `${content}`.trim());

  const header = [
    structuredResume.fullName,
    [
      structuredResume.currentTitle || structuredResume.targetRole,
      structuredResume.email,
      structuredResume.phone,
      structuredResume.location,
      structuredResume.linkedin,
      structuredResume.github,
    ]
      .filter(Boolean)
      .join(" | "),
  ]
    .filter(Boolean)
    .join("\n");

  return [
    header,
    ...sections.map(([title, content]) => `${title}\n${content}`),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const buildResumeFallback = (payload = {}) => {
  const structuredResume = normalizeStructuredResume({}, payload);

  if (!structuredResume.summary) {
    structuredResume.summary = [
      structuredResume.currentTitle || structuredResume.targetRole || "Aspiring professional",
      structuredResume.industry ? `with interest in ${structuredResume.industry}` : "",
      structuredResume.targetRole
        ? `focused on ${structuredResume.targetRole} opportunities`
        : "seeking relevant opportunities",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (!structuredResume.skills && payload.mustIncludeKeywords) {
    structuredResume.skills = payload.mustIncludeKeywords;
  }

  const resumeText = buildPlainTextFromStructuredResume(structuredResume);

  return {
    resumeText,
    structuredResume,
    summary:
      "Generated a template-ready resume draft using your provided details and fallback formatting.",
    highlights: [
      "Applied the selected template to a structured resume layout.",
      "Preserved the candidate details supplied in the form.",
      "Generated a usable draft even though the AI response was not fully parseable.",
    ],
    keywordStrategy: splitSkillValues(payload.mustIncludeKeywords || payload.skills).slice(0, 8),
    sectionNotes: [
      "Review experience and projects to add more metrics and outcomes.",
      "Refine the summary for the exact target role before applying.",
    ],
    generationMode: "fallback",
  };
};

const buildFallbackImprovedResume = (resumeText, options = {}) => {
  const {
    targetRole = "",
    jobDescription = "",
    focusAreas = [],
    extraInstructions = "",
  } = options;

  const heuristic = computeHeuristicAnalysis(resumeText, jobDescription, targetRole);
  const sections = detectSections(resumeText);
  const keywordStrategy = dedupe([
    ...heuristic.missingKeywords.slice(0, 6),
    ...getTopKeywords(`${jobDescription} ${targetRole} ${focusAreas.join(" ")}`, 8),
  ]).slice(0, 8);

  const summaryLine = [
    targetRole ? `${targetRole} aligned resume` : "Targeted resume draft",
    "optimized with fallback ATS guidance",
    keywordStrategy.length ? `and focus on ${keywordStrategy.slice(0, 4).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const insertedBlocks = [];

  if (!sections.summary) {
    insertedBlocks.push(`SUMMARY\n${summaryLine}.`);
  }

  if (!sections.skills && keywordStrategy.length) {
    insertedBlocks.push(`CORE SKILLS\n${keywordStrategy.join(", ")}`);
  }

  const improvedResume = [...insertedBlocks, resumeText].filter(Boolean).join("\n\n").trim();

  return {
    improvedResume,
    summary:
      "Generated a fallback resume rewrite using pre-defined ATS rules and your existing resume content.",
    changesMade: dedupe([
      !sections.summary ? "Added a targeted summary section to strengthen the opening." : "",
      !sections.skills && keywordStrategy.length
        ? "Added a core skills section based on role and job-description keywords."
        : "",
      heuristic.missingKeywords.length
        ? "Highlighted missing ATS keywords that should be woven into experience bullets."
        : "Kept the resume content intact and returned a safe fallback version.",
    ]).slice(0, 4),
    nextSteps: dedupe([
      ...heuristic.improvements,
      extraInstructions ? `Review the draft against this instruction: ${extraInstructions}` : "",
      "Add metrics and outcomes to the strongest experience bullets before final use.",
    ]).slice(0, 5),
    keywordStrategy,
    generationMode: "fallback",
  };
};

const computeHeuristicAnalysis = (resumeText, jobDescription, targetRole) => {
  const lower = resumeText.toLowerCase();
  const sections = detectSections(resumeText);
  const bulletLines = getBulletLines(resumeText);
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
  const hasPhone = /(?:\+\d{1,3}\s*)?(?:\(?\d{3}\)?[-.\s]*)?\d{3}[-.\s]*\d{4}/.test(
    resumeText,
  );
  const hasLinkedIn = /linkedin\.com\/in\//i.test(resumeText);
  const hasGithub = /github\.com\//i.test(resumeText);
  const quantifiedBullets = bulletLines.filter((line) =>
    /(\d+%|\d+x|\d+\+|\$\d+|\d+\s*(users|clients|projects|hours|days|weeks|months|years))/i.test(
      line,
    ),
  ).length;
  const actionVerbHits = ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${escapeRegex(verb)}\\b`, "i").test(lower),
  ).length;
  const firstPersonHits = (resumeText.match(/\b(i|me|my|mine)\b/gi) || []).length;
  const specialCharDensity =
    ((resumeText.match(/[^a-zA-Z0-9\s.,:%/+()\-]/g) || []).length /
      Math.max(1, resumeText.length)) *
    100;
  const dateLines = resumeText.split("\n").filter((line) =>
    /\b(20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(
      line,
    ),
  ).length;

  const keywordSource = `${jobDescription || ""} ${targetRole || ""}`.trim();
  const targetKeywords = getTopKeywords(keywordSource, 16);
  const matchedKeywords = targetKeywords.filter((keyword) =>
    new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(lower),
  );
  const missingKeywords = targetKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword),
  );

  const sectionScore = clampScore(
    (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) *
      100,
  );
  const keywordScore = clampScore(
    targetKeywords.length ? (matchedKeywords.length / targetKeywords.length) * 100 : 70,
  );
  const impactScore = clampScore(
    quantifiedBullets * 16 + actionVerbHits * 5 + Math.min(bulletLines.length, 10) * 3,
  );
  const readabilityScore = clampScore(
    52 +
      (bulletLines.length >= 4 ? 14 : bulletLines.length * 3) +
      (wordCount >= 280 && wordCount <= 850 ? 14 : 0) +
      (firstPersonHits ? -8 : 0) +
      (specialCharDensity > 1.6 ? -8 : 0),
  );
  const formattingScore = clampScore(
    55 +
      (dateLines >= 2 ? 12 : 0) +
      (specialCharDensity < 1.2 ? 12 : 0) +
      (hasLinkedIn || hasGithub ? 10 : 0) +
      (wordCount > 1100 ? -10 : 0),
  );
  const contactScore = clampScore(
    [hasEmail, hasPhone, hasLinkedIn || hasGithub].filter(Boolean).length * 33.34,
  );
  const atsScore = clampScore(
    sectionScore * 0.26 +
      keywordScore * 0.24 +
      impactScore * 0.18 +
      readabilityScore * 0.12 +
      formattingScore * 0.12 +
      contactScore * 0.08,
  );
  const confidence = clampScore(
    58 +
      (targetKeywords.length >= 8 ? 14 : targetKeywords.length * 1.5) +
      (wordCount >= 250 ? 10 : 0) +
      (sections.experience ? 8 : 0) +
      (sections.skills ? 6 : 0),
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
    {
      label: "First-person writing avoided",
      passed: firstPersonHits === 0,
      detail:
        firstPersonHits === 0
          ? "Resume uses ATS-friendly professional phrasing."
          : "Remove first-person wording like I, me, and my.",
    },
  ];

  const strengths = [];
  const improvements = [];
  if (matchedKeywords.length >= Math.max(4, Math.ceil(targetKeywords.length / 2))) {
    strengths.push("Resume aligns well with target role keywords.");
  } else if (targetKeywords.length) {
    improvements.push("Add more role-specific keywords from the target job description.");
  }
  if (quantifiedBullets >= 2) strengths.push("Experience shows measurable business impact.");
  else improvements.push("Rewrite bullets with metrics, scope, and results.");
  if (sections.projects || sections.certifications) strengths.push("Supplementary sections strengthen screening relevance.");
  else improvements.push("Projects or certifications can improve credibility for ATS and recruiters.");
  if (!sections.summary) improvements.push("Add a targeted professional summary near the top.");
  if (firstPersonHits > 0) improvements.push("Use resume phrasing instead of first-person statements.");

  return {
    atsScore,
    confidence,
    keywordScore,
    impactScore,
    readabilityScore,
    formattingScore,
    sectionScore,
    matchedKeywords,
    missingKeywords,
    atsChecks,
    strengths,
    improvements,
    resumeStats: {
      wordCount,
      bulletCount: bulletLines.length,
      quantifiedBulletCount: quantifiedBullets,
      actionVerbCoverage: actionVerbHits,
      dateLineCount: dateLines,
      firstPersonHits,
    },
  };
};

const getAIInsights = async (resumeText, jobDescription, targetRole, heuristic) => {
  const prompt = `
You are an expert ATS auditor and recruiter.
Analyze this resume against the target role and job description.

Target role: ${targetRole || "Not provided"}
Job description:
${jobDescription || "Not provided"}

Heuristic summary:
- ATS estimate: ${heuristic.atsScore}
- Confidence: ${heuristic.confidence}
- Keyword score: ${heuristic.keywordScore}
- Impact score: ${heuristic.impactScore}
- Formatting score: ${heuristic.formattingScore}
- Missing keywords: ${heuristic.missingKeywords.join(", ") || "None"}

Return JSON only:
{
  "summary": "string",
  "aiOverallScore": number,
  "recruiterView": "string",
  "topStrengths": ["string"],
  "topImprovements": ["string"],
  "atsRisks": ["string"],
  "missingKeywords": ["string"],
  "rewrittenBullets": [{"before": "string", "after": "string", "why": "string"}]
}
`;
  const data = await callGeminiAPI(
    [{ role: "user", content: `${prompt}\n\nResume:\n${resumeText.slice(0, 15000)}` }],
    1600,
    0.25,
  );
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText.trim()) throw new Error("Model returned empty resume analysis.");
  return parseJsonFromModel(rawText);
};

const getImprovedResumeFromAI = async (
  resumeText,
  {
    targetRole,
    jobDescription,
    focusAreas = [],
    tone = "professional",
    templateStyle = "modern",
    priority = "balanced",
    outputLength = "one_page",
    targetCompanies = "",
    mustKeep = "",
    extraInstructions = "",
  },
) => {
  const prompt = `
You are a senior resume writer.
Improve the resume below for ATS and recruiter readability.

Target role: ${targetRole || "Not provided"}
Job description:
${jobDescription || "Not provided"}
Focus areas: ${focusAreas.join(", ") || "overall improvement"}
Tone: ${tone}
Template style: ${templateStyle}
Priority: ${priority}
Preferred length: ${outputLength}
Target companies: ${targetCompanies || "Not provided"}
Must keep unchanged: ${mustKeep || "Not provided"}
Extra instructions: ${extraInstructions || "None"}

Return JSON only:
{
  "improvedResume": "plain text resume",
  "summary": "string",
  "changesMade": ["string"],
  "nextSteps": ["string"],
  "keywordStrategy": ["string"]
}
`;
  const data = await callGeminiAPI(
    [{ role: "user", content: `${prompt}\n\nOriginal resume:\n${resumeText.slice(0, 15000)}` }],
    2200,
    0.35,
  );
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText.trim()) throw new Error("Model returned empty improved resume.");
  return parseJsonFromModel(rawText);
};

const getBuiltResumeFromAI = async (payload) => {
  const prompt = `
You are a senior resume writer. Build a fresh ATS-friendly resume from scratch.
Return JSON only:
{
  "resumeText": "plain text resume",
  "structuredResume": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "currentTitle": "string",
    "yearsExperience": "string",
    "targetRole": "string",
    "summary": "string or newline-separated bullets",
    "skills": "comma-separated or newline-separated skills",
    "experience": "newline-separated bullet points",
    "internships": "newline-separated bullet points",
    "projects": "newline-separated bullet points",
    "leadership": "newline-separated bullet points",
    "education": "newline-separated entries",
    "certifications": "newline-separated entries",
    "achievements": "newline-separated bullet points"
  },
  "summary": "string",
  "highlights": ["string"],
  "keywordStrategy": ["string"],
  "sectionNotes": ["string"]
}

Candidate data:
${JSON.stringify(payload, null, 2)}
`;
  const data = await callGeminiAPI([{ role: "user", content: prompt }], 2200, 0.35);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText.trim()) throw new Error("Model returned empty resume draft.");
  return parseJsonFromModel(rawText);
};

export const analyzeResumePayload = async ({
  fileName,
  fileDataUrl,
  resumeText,
  jobDescription = "",
  targetRole = "",
}) => {
  const extractedText = await extractResumeText({ fileDataUrl, resumeText });
  if (!extractedText || extractedText.length < 120) {
    throw new Error("Could not extract enough text from this resume. Try a cleaner PDF/DOCX or a text-based resume.");
  }
  const heuristic = computeHeuristicAnalysis(extractedText, jobDescription, targetRole);
  let aiInsights;
  try {
    aiInsights = await getAIInsights(extractedText, jobDescription, targetRole, heuristic);
  } catch (error) {
    const aiStatus = getAIServiceStatus(error);
    aiInsights = {
      summary: aiStatus.reason,
      aiOverallScore: heuristic.atsScore,
      recruiterView: "The resume needs stronger role alignment, clearer impact, and cleaner formatting.",
      topStrengths: heuristic.strengths,
      topImprovements: heuristic.improvements,
      atsRisks: heuristic.atsChecks.filter((item) => !item.passed).map((item) => item.detail),
      missingKeywords: heuristic.missingKeywords,
      rewrittenBullets: [],
      modelFallback: true,
    };
  }
  const overallScore = clampScore(
    heuristic.atsScore * 0.7 + (Number(aiInsights.aiOverallScore) || heuristic.atsScore) * 0.3,
  );
  return {
    fileName: fileName || "Resume Text",
    overallScore,
    analysisMode: aiInsights.modelFallback ? "heuristic_fallback" : "hybrid",
    scoringNote:
      "This is a high-confidence ATS estimate based on common recruiter and ATS screening rules. Exact vendor-specific ATS scores cannot be guaranteed.",
    scores: {
      overall: overallScore,
      ats: heuristic.atsScore,
      confidence: heuristic.confidence,
      keywordAlignment: heuristic.keywordScore,
      impact: heuristic.impactScore,
      readability: heuristic.readabilityScore,
      formatting: heuristic.formattingScore,
      structure: heuristic.sectionScore,
    },
    summary: aiInsights.summary,
    recruiterView: aiInsights.recruiterView,
    strengths: dedupe([...(heuristic.strengths || []), ...(aiInsights.topStrengths || [])]).slice(0, 6),
    improvements: dedupe([...(heuristic.improvements || []), ...(aiInsights.topImprovements || [])]).slice(0, 8),
    atsRisks: dedupe(
      aiInsights.atsRisks ||
        heuristic.atsChecks.filter((item) => !item.passed).map((item) => item.detail),
    ).slice(0, 8),
    missingKeywords: dedupe(aiInsights.missingKeywords || heuristic.missingKeywords).slice(0, 16),
    matchedKeywords: heuristic.matchedKeywords.slice(0, 16),
    rewrittenBullets: (aiInsights.rewrittenBullets || []).slice(0, 4),
    atsChecks: heuristic.atsChecks,
    extractedTextPreview: extractedText.slice(0, 1800),
    extractedResumeText: extractedText,
    resumeStats: heuristic.resumeStats,
  };
};

export const improveResumePayload = async ({
  fileDataUrl,
  resumeText,
  targetRole = "",
  jobDescription = "",
  focusAreas = [],
  tone = "professional",
  templateStyle = "modern",
  priority = "balanced",
  outputLength = "one_page",
  targetCompanies = "",
  mustKeep = "",
  extraInstructions = "",
}) => {
  const extractedText = await extractResumeText({ fileDataUrl, resumeText });
  if (!extractedText || extractedText.length < 120) {
    throw new Error("Resume text is too short to improve.");
  }
  let aiResult;
  try {
    aiResult = await getImprovedResumeFromAI(
      extractedText,
      {
        targetRole,
        jobDescription,
        focusAreas,
        tone,
        templateStyle,
        priority,
        outputLength,
        targetCompanies,
        mustKeep,
        extraInstructions,
      },
    );
  } catch (error) {
    const fallbackResult = buildFallbackImprovedResume(extractedText, {
      targetRole,
      jobDescription,
      focusAreas,
      extraInstructions,
    });
    const improvedAnalysis = await analyzeResumePayload({
      fileName: "Improved Resume",
      resumeText: fallbackResult.improvedResume,
      targetRole,
      jobDescription,
    });
    return {
      improvedResume: fallbackResult.improvedResume,
      summary: `${fallbackResult.summary} ${getAIServiceStatus(error).reason}`.trim(),
      changesMade: fallbackResult.changesMade || [],
      nextSteps: fallbackResult.nextSteps || [],
      keywordStrategy: fallbackResult.keywordStrategy || [],
      generationMode: fallbackResult.generationMode,
      improvedAnalysis,
    };
  }
  const improvedAnalysis = await analyzeResumePayload({
    fileName: "Improved Resume",
    resumeText: aiResult.improvedResume,
    targetRole,
    jobDescription,
  });
  return {
    improvedResume: aiResult.improvedResume,
    summary: aiResult.summary,
    changesMade: aiResult.changesMade || [],
    nextSteps: aiResult.nextSteps || [],
    keywordStrategy: aiResult.keywordStrategy || [],
    generationMode: "ai",
    improvedAnalysis,
  };
};

export const buildResumeFromScratch = async (payload) => {
  let built;
  try {
    built = await getBuiltResumeFromAI(payload);
  } catch {
    built = buildResumeFallback(payload);
  }

  const structuredResume = normalizeStructuredResume(built.structuredResume || {}, payload);
  const resumeText = normalizeResumeField(built.resumeText) || buildPlainTextFromStructuredResume(structuredResume);
  const analysis = await analyzeResumePayload({
    fileName: "Generated Resume",
    resumeText,
    targetRole: payload.targetRole,
    jobDescription: payload.jobDescription,
  });
  return {
    resumeText,
    structuredResume,
    templateStyle: payload.templateStyle || "modern",
    summary: built.summary,
    highlights: built.highlights || [],
    keywordStrategy: built.keywordStrategy || [],
    sectionNotes: built.sectionNotes || [],
    generationMode: built.generationMode || "ai",
    analysis,
  };
};
