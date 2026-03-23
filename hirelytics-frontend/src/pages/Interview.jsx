import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { QuestionCard } from "../components/QuestionCard";
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";

export const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addInterviewRecord } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const {
    interviewType = "hr",
    difficulty = "easy",
    questions: generatedQuestions = [],
  } = location.state || {};
  const TIME_LIMIT = 60;

  useEffect(() => {
    if (isTimeUp) return;

    const timer = setInterval(() => {
      setTimePerQuestion((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          setShowTimeWarning(false);
          return 0;
        }
        if (prev === 11) {
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeUp]);

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

  const handleNext = () => {
    if (currentQuestion === questions.length - 1 || isTimeUp) {
      const score = calculateScore();
      addInterviewRecord({
        type: interviewType,
        difficulty,
        score,
        timePerQuestion: TIME_LIMIT - timePerQuestion,
        totalTime,
        answers,
      });
      navigate("/result", {
        state: {
          score,
          answers,
          questions,
          interviewType,
          difficulty,
          totalTime,
          isTimeUp,
        },
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setTimePerQuestion(TIME_LIMIT);
      setShowTimeWarning(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTimePerQuestion(TIME_LIMIT);
      setShowTimeWarning(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    Object.values(answers).forEach((answer) => {
      score += Math.min(Math.ceil(answer.length / 50), 20);
    });
    return Math.min(score, 100);
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: "text-emerald-600 dark:text-emerald-400",
      medium: "text-orange-600 dark:text-orange-400",
      hard: "text-red-600 dark:text-red-400",
    };
    return colors[difficulty] || colors.easy;
  };

  const formatTime = (seconds) => {
    return `${seconds.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Interview Session
              </h1>
              <div className="flex gap-3 mt-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Type:{" "}
                  <span className="font-semibold capitalize">
                    {interviewType}
                  </span>
                </span>
                <span
                  className={`text-sm font-semibold capitalize ${getDifficultyColor()}`}
                >
                  Level: {difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Total Time
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.floor(totalTime / 60)}:{formatTime(totalTime % 60)}
                </p>
              </div>
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
            className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
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
            isTimeUp={isTimeUp}
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
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white transition-colors"
            >
              {currentQuestion === questions.length - 1 || isTimeUp
                ? "Submit"
                : "Next"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
