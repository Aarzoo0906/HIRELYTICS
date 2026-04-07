import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { PageHeader } from "../components/PageHeader";
import { PageClock } from "../components/PageClock";
import { Sidebar } from "../components/Sidebar";
import { QuestionCard } from "../components/QuestionCard";
import { analyzeInterviewPerformance } from "../utils/interviewAnalysis";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addInterviewRecord } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const {
    interviewType = "hr",
    difficulty = "easy",
    questions: generatedQuestions = [],
  } = location.state || {};
  const technicalQuestions = {
    easy: [
      {
        id: 1,
        title: "Explain the difference between let, const, and var",
        description: "Provide a clear explanation with code examples.",
      },
      {
        id: 2,
        title: "What is the event loop in JavaScript?",
        description: "Explain how asynchronous operations work.",
      },
      {
        id: 3,
        title: "What are React hooks?",
        description: "Describe the purpose and common hooks you use.",
      },
    ],
    medium: [
      {
        id: 1,
        title: "Explain closure and provide a practical use case",
        description: "Demonstrate understanding with a real-world example.",
      },
      {
        id: 2,
        title: "How does async/await work compared to promises?",
        description: "Explain error handling and code readability benefits.",
      },
      {
        id: 3,
        title: "Design a caching system for API calls",
        description: "Discuss implementation strategy and trade-offs.",
      },
      {
        id: 4,
        title: "Explain the Virtual DOM and its benefits",
        description: "Discuss performance implications.",
      },
      {
        id: 5,
        title: "What are design patterns you've implemented?",
        description: "Share specific patterns and their benefits.",
      },
    ],
    hard: [
      {
        id: 1,
        title: "Design a scalable microservices architecture",
        description:
          "Discuss service communication, data consistency, and deployment.",
      },
      {
        id: 2,
        title: "Optimize a slow database query affecting millions of records",
        description:
          "Explain indexing strategies, query optimization, and trade-offs.",
      },
      {
        id: 3,
        title: "Implement a real-time collaboration system like Google Docs",
        description: "Discuss conflict resolution, OT/CRDT algorithms.",
      },
      {
        id: 4,
        title: "Design a distributed rate limiter",
        description:
          "Explain algorithms, consistency, and scalability considerations.",
      },
      {
        id: 5,
        title: "How would you handle state management at scale?",
        description:
          "Discuss Redux, Zustand, or custom solutions with trade-offs.",
      },
    ],
  };

  const hrQuestions = {
    easy: [
      {
        id: 1,
        title: "Tell me about yourself",
        description:
          "Give a brief professional summary including your background, experience, and what you are looking for in your next role.",
      },
      {
        id: 2,
        title: "What are your greatest strengths?",
        description:
          "Discuss the skills and qualities that make you an excellent candidate for this position.",
      },
      {
        id: 3,
        title: "What are your weaknesses?",
        description: "Be honest but show awareness and improvement efforts.",
      },
    ],
    medium: [
      {
        id: 1,
        title: "Tell me about a time you faced a conflict with a colleague",
        description: "Explain the situation, your action, and the resolution.",
      },
      {
        id: 2,
        title: "Describe a project where you missed a deadline",
        description: "Discuss what happened and how you handled it.",
      },
      {
        id: 3,
        title: "How do you handle stress and pressure?",
        description: "Share personal coping strategies and examples.",
      },
      {
        id: 4,
        title: "Tell me about your leadership experience",
        description: "Describe a time you led or influenced a team.",
      },
      {
        id: 5,
        title: "Why do you want to work for our company?",
        description: "Show genuine interest and alignment with company values.",
      },
    ],
    hard: [
      {
        id: 1,
        title: "Tell me about a time you had to make a difficult decision",
        description: "Explain the context, considerations, and outcome.",
      },
      {
        id: 2,
        title: "How would you handle working with a manager you disagree with?",
        description: "Discuss communication strategies and professionalism.",
      },
      {
        id: 3,
        title: "Describe a time you failed significantly",
        description: "Be vulnerable about lessons learned and growth.",
      },
      {
        id: 4,
        title: "How do you approach learning new technologies or skills?",
        description: "Share your learning strategy and recent examples.",
      },
      {
        id: 5,
        title: "Where do you see yourself in 5 years?",
        description: "Discuss career goals aligned with company growth.",
      },
    ],
  };

  const questions = useMemo(() => {
    if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
      return generatedQuestions.map((question, index) => ({
        id: index + 1,
        title:
          typeof question === "string"
            ? question
            : question?.title || question?.question || `Question ${index + 1}`,
        description:
          typeof question === "string"
            ? "Answer in detail with clear examples."
            : question?.description || "Answer in detail with clear examples.",
      }));
    }

    const questionMap =
      interviewType === "technical" ? technicalQuestions : hrQuestions;
    return questionMap[difficulty] || questionMap.easy;
  }, [generatedQuestions, interviewType, difficulty]);

  const handleAnswerChange = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer,
    });
  };

  const handleNext = async () => {
    if (!answers[currentQuestion]?.trim()) {
      return;
    }

    if (currentQuestion === questions.length - 1) {
      const analysis = analyzeInterviewPerformance({ answers, questions });
      const localScore = analysis.overallScore;
      const savedInterview = await addInterviewRecord({
        type: interviewType,
        difficulty,
        score: localScore,
        answers,
        questions,
      });

      const finalScore = savedInterview?.score ?? localScore;
      navigate("/result", {
        state: {
          score: finalScore,
          answers,
          questions,
          interviewType,
          difficulty,
          analysis:
            finalScore === localScore
              ? analysis
              : analyzeInterviewPerformance({ answers, questions }),
        },
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: "text-emerald-600 dark:text-emerald-400",
      medium: "text-orange-600 dark:text-orange-400",
      hard: "text-red-600 dark:text-red-400",
    };
    return colors[difficulty] || colors.easy;
  };
  const isTimeUp = false;
  const showTimeWarning = false;
  const timePerQuestion = 0;
  const formatTime = (seconds) => `${seconds.toString().padStart(2, "0")}s`;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <PageClock />

          <PageHeader
            eyebrow="Live Interview"
            title="Interview Session"
            description={`Answer confidently and keep your pace steady. Type: ${interviewType}. Difficulty: ${difficulty}.`}
            icon={Briefcase}
            backFallbackTo="/interview-selection"
          />

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Type: <span className="font-semibold capitalize">{interviewType}</span>
              </span>
              <span
                className={`rounded-full bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800 ${getDifficultyColor()}`}
              >
                Level: {difficulty}
              </span>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No timer in this session
              </p>
              <p className="text-base text-slate-900 dark:text-slate-100">
                You can move ahead only after writing an answer.
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>

          {isTimeUp && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  Time's Up!
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                  Your time for this question has expired. Click "Next" to move
                  on.
                </p>
              </div>
            </div>
          )}

          {showTimeWarning && !isTimeUp && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
              <Clock
                size={18}
                className="text-orange-600 dark:text-orange-400 flex-shrink-0"
              />
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                ⚠️ Only {formatTime(timePerQuestion)} remaining!
              </p>
            </div>
          )}

          <div
            className={`hidden items-center justify-center p-4 rounded-lg border-2 transition-colors ${
              isTimeUp
                ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                : timePerQuestion <= 10
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                  : "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
            }`}
          >
            <Clock
              size={24}
              className={`mr-3 ${
                isTimeUp
                  ? "text-red-600 dark:text-red-400"
                  : timePerQuestion <= 10
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-teal-600 dark:text-teal-400"
              }`}
            />
            <span
              className={`text-3xl font-bold font-mono ${
                isTimeUp
                  ? "text-red-600 dark:text-red-400"
                  : timePerQuestion <= 10
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-teal-600 dark:text-teal-400"
              }`}
            >
              {formatTime(timePerQuestion)}
            </span>
          </div>

          <QuestionCard
            question={questions[currentQuestion]}
            answer={answers[currentQuestion] || ""}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            isLast={currentQuestion === questions.length - 1}
          />

          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="text-sm">{currentQuestion + 1}</span>
              <span className="text-sm">/</span>
              <span className="text-sm">{questions.length}</span>
            </div>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion]?.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
              <ChevronRight size={20} />
            </button>
          </div>

          <AppFooter />
        </div>
      </main>
    </div>
  );
};
