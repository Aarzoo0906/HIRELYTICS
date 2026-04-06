const FILLER_WORDS = new Set([
  "um",
  "uh",
  "like",
  "basically",
  "actually",
  "literally",
  "you know",
  "sort of",
  "kind of",
  "i think",
  "maybe",
  "probably",
  "just",
]);

const CONFIDENT_WORDS = new Set([
  "led",
  "built",
  "delivered",
  "improved",
  "optimized",
  "resolved",
  "designed",
  "implemented",
  "managed",
  "created",
  "achieved",
  "owned",
  "reduced",
  "increased",
  "collaborated",
]);

const EXAMPLE_MARKERS = [
  "for example",
  "for instance",
  "for me",
  "in my project",
  "in my internship",
  "in my previous role",
  "i worked on",
  "i handled",
  "i led",
  "i built",
  "when i",
];

const HEDGE_MARKERS = [
  "maybe",
  "perhaps",
  "i guess",
  "i think",
  "i believe",
  "might",
  "kind of",
  "sort of",
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundScore = (value) => Math.round(clamp(value, 0, 100));

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .match(/[a-z0-9']+/g)
    ?.filter(Boolean) || [];

const splitSentences = (text = "") =>
  text
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const getQuestionKeywords = (question) => {
  const source =
    typeof question === "string"
      ? question
      : `${question?.title || question?.question || ""} ${question?.description || ""}`;

  return tokenize(source).filter(
    (word) => word.length > 3 && !STOP_WORDS.has(word),
  );
};

const countMatches = (text, markers) => {
  const lower = text.toLowerCase();
  return markers.reduce(
    (count, marker) => count + (lower.includes(marker) ? 1 : 0),
    0,
  );
};

const getTopWordShare = (words = []) => {
  if (!words.length) {
    return 0;
  }

  const counts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(counts));
  return maxCount / words.length;
};

const buildPerAnswerFeedback = ({
  wordCount,
  relevanceScore,
  repeatedRatio,
  topWordShare,
  fillerHits,
  exampleHits,
}) => {
  if (wordCount === 0) {
    return "No answer provided.";
  }

  if (relevanceScore < 30) {
    return "This answer does not address the question clearly enough. Stay closer to the topic and use a relevant example.";
  }

  if (repeatedRatio > 0.5 || topWordShare > 0.22) {
    return "This answer repeats itself too much. Use fewer repeated words and add specific points.";
  }

  if (wordCount < 25) {
    return "Add more depth and explain your reasoning with a concrete example.";
  }

  if (fillerHits > 2) {
    return "Reduce filler words and keep the answer more direct and structured.";
  }

  if (exampleHits === 0) {
    return "A relevant example would make this answer more convincing.";
  }

  return "Relevant answer with a reasonable structure. Add a sharper result or outcome to make it stronger.";
};

const getAnswerInsights = (answer = "", question = {}) => {
  const trimmed = answer.trim();
  const words = tokenize(trimmed);
  const meaningfulWords = words.filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word),
  );
  const sentences = splitSentences(trimmed);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount ? wordCount / sentenceCount : wordCount;
  const questionKeywords = getQuestionKeywords(question);
  const questionKeywordPool = [...new Set(questionKeywords)];
  const uniqueWords = new Set(words);
  const repeatedRatio = wordCount ? 1 - uniqueWords.size / wordCount : 0;
  const topWordShare = getTopWordShare(words);
  const numericMatches = (trimmed.match(/\d+/g) || []).length;
  const exampleHits = countMatches(trimmed, EXAMPLE_MARKERS);
  const confidenceHits = words.filter((word) => CONFIDENT_WORDS.has(word)).length;
  const hedgeHits = countMatches(trimmed, HEDGE_MARKERS);
  const fillerHits = Array.from(FILLER_WORDS).reduce((count, filler) => {
    const safeFiller = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = trimmed.toLowerCase().match(new RegExp(`\\b${safeFiller}\\b`, "g"));
    return count + (matches?.length || 0);
  }, 0);
  const weirdTokenCount = meaningfulWords.filter(
    (word) => word.length >= 5 && !/[aeiou]/.test(word),
  ).length;
  const repeatedCharPattern = /(.)\1{4,}/.test(trimmed.toLowerCase());

  const keywordMatches = questionKeywordPool.filter((keyword) =>
    meaningfulWords.includes(keyword),
  ).length;
  const keywordCoverage = questionKeywordPool.length
    ? keywordMatches / questionKeywordPool.length
    : 0.35;
  const meaningfulDensity = wordCount ? meaningfulWords.length / wordCount : 0;

  const relevanceScore =
    wordCount === 0
      ? 0
      : clamp(
          18 +
            keywordCoverage * 62 +
            Math.min(exampleHits, 2) * 7 +
            Math.min(numericMatches, 2) * 4 +
            Math.min(meaningfulDensity, 0.8) * 18 -
            repeatedRatio * 28 -
            topWordShare * 40 -
            weirdTokenCount * 8 -
            (repeatedCharPattern ? 18 : 0),
          0,
          100,
        );

  const completenessScore =
    wordCount === 0
      ? 0
      : clamp(
          12 +
            Math.min(wordCount, 170) * 0.18 +
            sentenceCount * 4 +
            relevanceScore * 0.42 +
            exampleHits * 5 +
            numericMatches * 2,
          0,
          100,
        );

  const clarityScore =
    wordCount === 0
      ? 0
      : clamp(
          48 +
            Math.min(sentenceCount, 6) * 2 +
            relevanceScore * 0.28 -
            Math.max(avgSentenceLength - 24, 0) * 1.2 -
            fillerHits * 7 -
            repeatedRatio * 34 -
            topWordShare * 22,
          0,
          100,
        );

  const confidenceScore =
    wordCount === 0
      ? 0
      : clamp(
          42 +
            Math.min(confidenceHits, 5) * 5 +
            exampleHits * 4 +
            relevanceScore * 0.2 -
            hedgeHits * 8 -
            fillerHits * 5,
          0,
          100,
        );

  const flags = {
    tooShort: wordCount > 0 && wordCount < 15,
    lowRelevance: wordCount >= 12 && relevanceScore < 30,
    repetitive: repeatedRatio > 0.5 || topWordShare > 0.22,
    suspicious: weirdTokenCount >= 2 || repeatedCharPattern,
  };

  let answerScore = roundScore(
    completenessScore * 0.4 +
      clarityScore * 0.25 +
      confidenceScore * 0.15 +
      relevanceScore * 0.2,
  );

  if (flags.lowRelevance) {
    answerScore = Math.min(answerScore, 28);
  }
  if (flags.repetitive) {
    answerScore = Math.min(answerScore, 35);
  }
  if (flags.suspicious) {
    answerScore = Math.min(answerScore, 18);
  }
  if (flags.tooShort) {
    answerScore = Math.min(answerScore, 30);
  }

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength,
    keywordCoverage,
    numericMatches,
    exampleHits,
    confidenceHits,
    hedgeHits,
    fillerHits,
    relevanceScore,
    repeatedRatio,
    topWordShare,
    meaningfulDensity,
    completenessScore,
    clarityScore,
    confidenceScore,
    answerScore,
    flags,
    feedback: buildPerAnswerFeedback({
      wordCount,
      relevanceScore,
      repeatedRatio,
      topWordShare,
      fillerHits,
      exampleHits,
    }),
  };
};

const getMetricFeedback = (metricName, score, aggregate) => {
  switch (metricName) {
    case "Answer Completeness":
      if (score >= 75) return "You covered most questions with enough depth.";
      if (aggregate.lowRelevanceAnswers > 0)
        return "Some answers drift away from the actual question. Stay more relevant.";
      if (aggregate.avgWordCount < 45)
        return "Add more substance so each answer feels complete.";
      return "Use fuller explanations, examples, and outcomes.";
    case "Communication Clarity":
      if (score >= 75) return "Your responses are mostly clear and easy to follow.";
      if (aggregate.repetitiveAnswers > 0)
        return "Avoid repeating the same words or ideas across an answer.";
      if (aggregate.fillerHits > 0)
        return "Reduce filler words to make your communication cleaner.";
      return "Break answers into shorter, more logical steps.";
    case "Confidence Level":
      if (score >= 75) return "Your wording sounds direct and action-oriented.";
      if (aggregate.lowRelevanceAnswers > 0)
        return "Confidence only counts when the answer actually addresses the question.";
      if (aggregate.hedgeHits > 0)
        return "Replace hesitant phrases with clearer statements.";
      return "State your actions, decisions, and outcomes more directly.";
    case "Answer Relevance":
      if (score >= 75) return "Your answers stay well aligned with the question prompts.";
      return "Focus more tightly on what the interviewer actually asked.";
    default:
      return "";
  }
};

export const analyzeInterviewPerformance = ({ answers = {}, questions = [] }) => {
  const answerEntries = questions.map((question, index) => ({
    question,
    answer: typeof answers[index] === "string" ? answers[index] : "",
  }));

  const answeredEntries = answerEntries.filter(({ answer }) => answer.trim());
  const totalQuestions = questions.length || answerEntries.length || 0;
  const answerRate = totalQuestions ? answeredEntries.length / totalQuestions : 0;
  const insights = answeredEntries.map(({ answer, question }) =>
    getAnswerInsights(answer, question),
  );

  if (!insights.length) {
    return {
      overallScore: 0,
      metrics: [
        {
          title: "Answer Completeness",
          score: 0,
          detail: "No answer data is available for this interview.",
        },
        {
          title: "Communication Clarity",
          score: 0,
          detail: "No answer data is available for this interview.",
        },
        {
          title: "Confidence Level",
          score: 0,
          detail: "No answer data is available for this interview.",
        },
        {
          title: "Answer Relevance",
          score: 0,
          detail: "No answer data is available for this interview.",
        },
      ],
      strengths: [],
      improvements: ["Complete the interview answers to receive feedback."],
      aggregate: {
        answeredQuestions: 0,
        totalQuestions,
      },
      perQuestion: [],
    };
  }

  const aggregate = insights.reduce(
    (summary, item) => ({
      totalWords: summary.totalWords + item.wordCount,
      totalSentences: summary.totalSentences + item.sentenceCount,
      keywordCoverage: summary.keywordCoverage + item.keywordCoverage,
      numericMatches: summary.numericMatches + item.numericMatches,
      exampleHits: summary.exampleHits + item.exampleHits,
      confidenceHits: summary.confidenceHits + item.confidenceHits,
      hedgeHits: summary.hedgeHits + item.hedgeHits,
      fillerHits: summary.fillerHits + item.fillerHits,
      relevanceScore: summary.relevanceScore + item.relevanceScore,
      completenessScore: summary.completenessScore + item.completenessScore,
      clarityScore: summary.clarityScore + item.clarityScore,
      confidenceScore: summary.confidenceScore + item.confidenceScore,
      avgSentenceLength: summary.avgSentenceLength + item.avgSentenceLength,
      lowRelevanceAnswers: summary.lowRelevanceAnswers + (item.flags.lowRelevance ? 1 : 0),
      repetitiveAnswers: summary.repetitiveAnswers + (item.flags.repetitive ? 1 : 0),
      suspiciousAnswers: summary.suspiciousAnswers + (item.flags.suspicious ? 1 : 0),
    }),
    {
      totalWords: 0,
      totalSentences: 0,
      keywordCoverage: 0,
      numericMatches: 0,
      exampleHits: 0,
      confidenceHits: 0,
      hedgeHits: 0,
      fillerHits: 0,
      relevanceScore: 0,
      completenessScore: 0,
      clarityScore: 0,
      confidenceScore: 0,
      avgSentenceLength: 0,
      lowRelevanceAnswers: 0,
      repetitiveAnswers: 0,
      suspiciousAnswers: 0,
    },
  );

  const count = insights.length;
  const avgWordCount = aggregate.totalWords / count;
  const avgSentenceLength = aggregate.avgSentenceLength / count;
  const avgKeywordCoverage = aggregate.keywordCoverage / count;
  const relevance = roundScore(
    aggregate.relevanceScore / count - (1 - answerRate) * 25,
  );
  const completeness = roundScore(
    aggregate.completenessScore / count - (1 - answerRate) * 20,
  );
  const clarity = roundScore(
    aggregate.clarityScore / count - aggregate.suspiciousAnswers * 8 - (1 - answerRate) * 10,
  );
  const confidence = roundScore(
    aggregate.confidenceScore / count - aggregate.lowRelevanceAnswers * 6 - (1 - answerRate) * 10,
  );

  let overallScore = roundScore(
    completeness * 0.34 +
      clarity * 0.24 +
      confidence * 0.16 +
      relevance * 0.26,
  );

  if (aggregate.lowRelevanceAnswers >= Math.ceil(count / 2)) {
    overallScore = Math.min(overallScore, 35);
  }
  if (aggregate.repetitiveAnswers >= Math.ceil(count / 2)) {
    overallScore = Math.min(overallScore, 30);
  }
  if (aggregate.suspiciousAnswers > 0) {
    overallScore = Math.min(overallScore, 18);
  }

  const normalizedAggregate = {
    answeredQuestions: answeredEntries.length,
    totalQuestions,
    avgWordCount,
    avgSentenceLength,
    keywordCoverage: avgKeywordCoverage,
    numericMatches: aggregate.numericMatches,
    exampleHits: aggregate.exampleHits,
    confidenceHits: aggregate.confidenceHits,
    hedgeHits: aggregate.hedgeHits,
    fillerHits: aggregate.fillerHits,
    lowRelevanceAnswers: aggregate.lowRelevanceAnswers,
    repetitiveAnswers: aggregate.repetitiveAnswers,
    suspiciousAnswers: aggregate.suspiciousAnswers,
  };

  const strengths = [];
  const improvements = [];

  if (relevance >= 70) {
    strengths.push("Your answers mostly stay aligned with the questions asked.");
  } else {
    improvements.push("Stay closer to the exact question instead of adding generic or unrelated text.");
  }

  if (completeness >= 75) {
    strengths.push("You covered most answers with useful depth and detail.");
  } else if (avgWordCount < 45) {
    improvements.push("Add more depth so each answer feels complete and convincing.");
  } else {
    improvements.push("Explain your reasoning more fully before wrapping up each answer.");
  }

  if (clarity >= 75) {
    strengths.push("Your responses are mostly structured and easy to follow.");
  } else if (normalizedAggregate.repetitiveAnswers > 0) {
    improvements.push("Avoid repeating the same words or phrases within an answer.");
  } else if (normalizedAggregate.fillerHits > 0) {
    improvements.push("Reduce filler words and keep each point more direct.");
  } else {
    improvements.push("Use shorter sentences and clearer sequencing in your explanations.");
  }

  if (confidence >= 75) {
    strengths.push("Your language sounds confident and action-oriented.");
  } else if (normalizedAggregate.hedgeHits > 0) {
    improvements.push("Replace hesitant phrases with direct, confident wording.");
  } else {
    improvements.push("Describe your role, decisions, and outcomes more assertively.");
  }

  if (normalizedAggregate.exampleHits > 0 && normalizedAggregate.numericMatches > 0) {
    strengths.push("You supported some answers with examples and measurable outcomes.");
  } else {
    improvements.push("Include concrete examples and measurable results where possible.");
  }

  if (normalizedAggregate.suspiciousAnswers > 0) {
    improvements.push("Avoid random, repetitive, or meaningless text because it sharply lowers your score.");
  }

  const uniqueStrengths = [...new Set(strengths)].slice(0, 4);
  const uniqueImprovements = [...new Set(improvements)]
    .filter((item) => !uniqueStrengths.includes(item))
    .slice(0, 5);

  const metrics = [
    {
      title: "Answer Completeness",
      score: completeness,
      detail: getMetricFeedback("Answer Completeness", completeness, normalizedAggregate),
    },
    {
      title: "Communication Clarity",
      score: clarity,
      detail: getMetricFeedback("Communication Clarity", clarity, normalizedAggregate),
    },
    {
      title: "Confidence Level",
      score: confidence,
      detail: getMetricFeedback("Confidence Level", confidence, normalizedAggregate),
    },
    {
      title: "Answer Relevance",
      score: relevance,
      detail: getMetricFeedback("Answer Relevance", relevance, normalizedAggregate),
    },
  ];

  return {
    overallScore,
    metrics,
    strengths: uniqueStrengths,
    improvements: uniqueImprovements,
    aggregate: normalizedAggregate,
    perQuestion: insights.map((item) => ({
      score: item.answerScore,
      feedback: item.feedback,
      flags: item.flags,
      wordCount: item.wordCount,
      relevanceScore: item.relevanceScore,
    })),
  };
};
