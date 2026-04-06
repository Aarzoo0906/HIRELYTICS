import dotenv from "dotenv";
dotenv.config();

import { generateQuestions, evaluateAnswers } from "./src/services/ai.service.js";

console.log("Testing AI Service Integration");
console.log("==============================\n");

const testGenerateQuestions = async () => {
  try {
    console.log("1. Testing generateQuestions()...\n");
    const questions = await generateQuestions("technical", "medium", "JavaScript");
    
    console.log("✅ Questions Generated:");
    console.log(`   Total: ${questions.length} questions\n`);
    questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q}\n`);
    });
    
    return questions;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
};

const testEvaluateAnswers = async (questions) => {
  if (!questions || questions.length === 0) {
    console.log("\n2. Skipping evaluateAnswers (no questions generated)");
    return;
  }

  try {
    console.log("\n2. Testing evaluateAnswers()...");
    
    const testQuestionsWithAnswers = [
      {
        question: questions[0] || "What is JavaScript?",
        answer: "JavaScript is a programming language that runs in browsers and can be used for both frontend and backend development."
      },
      {
        question: questions[1] || "Explain async/await",
        answer: "Async/await is syntactic sugar for promises that makes asynchronous code easier to read and write, similar to synchronous code."
      }
    ];

    const evaluation = await evaluateAnswers(testQuestionsWithAnswers, "technical");
    
    console.log("✅ Evaluation Result:");
    console.log(`  Score: ${evaluation.score}/100`);
    console.log(`  Feedback: ${evaluation.rawFeedback.substring(0, 200)}...`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

const runTests = async () => {
  const questions = await testGenerateQuestions();
  await testEvaluateAnswers(questions);
  console.log("\n✅ All tests completed!");
};

runTests();
