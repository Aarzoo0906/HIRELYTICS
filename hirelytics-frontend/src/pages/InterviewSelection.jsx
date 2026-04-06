import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { PageClock } from "../components/PageClock";
import { PageHeader } from "../components/PageHeader";
import { Sidebar } from "../components/Sidebar";
import { HR_INTERVIEW_TOPICS, TECHNICAL_INTERVIEW_TOPICS } from "../data/topicCatalog";
import {
  Briefcase,
  Users,
  Zap,
  TrendingUp,
  Award,
  ChevronDown,
} from "lucide-react";

export const InterviewSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const interviewTypes = [
    {
      id: "technical",
      name: "Technical Interview",
      icon: Briefcase,
      description: "Test your coding and technical problem-solving skills",
    },
    {
      id: "hr",
      name: "HR Interview",
      icon: Users,
      description: "Prepare for behavioral and situational questions",
    },
  ];

  const difficulties = [
    {
      id: "easy",
      name: "Easy",
      icon: Zap,
      description: "Perfect for beginners",
    },
    {
      id: "medium",
      name: "Medium",
      icon: TrendingUp,
      description: "Intermediate level",
    },
    {
      id: "hard",
      name: "Hard",
      icon: Award,
      description: "Expert level challenge",
    },
  ];

  const topicsByType = {
    technical: TECHNICAL_INTERVIEW_TOPICS,
    hr: HR_INTERVIEW_TOPICS,
  };

  const currentTopics = selectedType ? topicsByType[selectedType] : [];

  const handleStartInterview = async () => {
    if (!selectedType || !selectedDifficulty || !selectedTopic || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    const apiBaseUrl =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000/api";

    try {
      console.log("Starting interview with:", {
        type: selectedType,
        difficulty: selectedDifficulty,
        topic: selectedTopic,
        apiUrl: `${apiBaseUrl}/interview/generate-questions`,
      });

      const response = await fetch(`${apiBaseUrl}/interview/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          difficulty: selectedDifficulty,
          topic: selectedTopic,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is valid JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid response format. Expected JSON, got:", text.slice(0, 200));
        throw new Error(
          `Server error: Expected JSON but got ${contentType || "unknown format"}. Make sure the backend server is running.`
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(
          "Server returned invalid JSON. Please ensure the backend server is running and healthy."
        );
      }

      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions received from server");
      }

      console.log("Questions received:", data.questions.length);

      navigate("/interview", {
        state: {
          interviewType: selectedType,
          difficulty: selectedDifficulty,
          topic: selectedTopic,
          questions: data.questions || [],
        },
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setGenerationError(
        error.message ||
        "Unable to start interview. Please check your connection and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = selectedType && selectedDifficulty && selectedTopic;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageClock />
          <PageHeader
            eyebrow="Interview Setup"
            title="Customize Your Interview"
            description="Select interview type, difficulty level, and topic. AI will generate dynamic questions based on your selections."
            icon={Briefcase}
            backFallbackTo="/dashboard"
          />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Interview Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedTopic(null);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-900/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Icon
                        size={28}
                        className={`flex-shrink-0 ${
                          isSelected
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {type.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {type.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-teal-600 dark:bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Difficulty Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((difficulty) => {
                const Icon = difficulty.icon;
                const isSelected = selectedDifficulty === difficulty.id;

                const difficultyColors = {
                  easy: {
                    selected:
                      "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20",
                    icon: "text-emerald-600 dark:text-emerald-400",
                  },
                  medium: {
                    selected:
                      "border-orange-500 dark:border-orange-400 bg-orange-50/50 dark:bg-orange-900/20",
                    icon: "text-orange-600 dark:text-orange-400",
                  },
                  hard: {
                    selected:
                      "border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/20",
                    icon: "text-red-600 dark:text-red-400",
                  },
                };

                const colors = difficultyColors[difficulty.id];

                return (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`p-6 rounded-2xl border-2 transition-all text-center ${
                      isSelected
                        ? `${colors.selected} border-2`
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Icon
                      size={28}
                      className={`mx-auto mb-3 ${
                        isSelected
                          ? colors.icon
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {difficulty.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {difficulty.description}
                    </p>
                    {isSelected && (
                      <div className="mt-3 flex justify-center">
                        <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Select Topic
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedType
                ? `Choose a ${selectedType === "technical" ? "technical" : "soft skill"} topic for AI question generation`
                : "Select an interview type first"}
            </p>

            {selectedType ? (
              <div className="relative">
                <select
                  value={selectedTopic || ""}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                >
                  <option value="">-- Select a Topic --</option>
                  {currentTopics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none"
                />
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400 text-center italic">
                  Topics will appear after selecting an interview type
                </p>
              </div>
            )}

            {selectedType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {currentTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  const isSelected = selectedTopic === topic.name;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.name)}
                      className={`rounded-xl border-2 p-4 transition-all text-left ${
                        isSelected
                          ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          style={
                            topic.accent
                              ? {
                                  borderColor: `${topic.accent}55`,
                                  color: topic.accent,
                                  backgroundColor: `${topic.accent}12`,
                                }
                              : undefined
                          }
                        >
                          {TopicIcon ? <TopicIcon size={22} /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{topic.name}</span>
                            {isSelected && (
                              <span className="text-xs bg-teal-600 dark:bg-teal-500 text-white px-2 py-1 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          {topic.description ? (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {topic.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex gap-4 pt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-xl px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartInterview}
              disabled={!isFormValid || isGenerating}
              className="flex-1 rounded-xl px-6 py-3 font-semibold bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isFormValid
                ? "Select all options"
                : isGenerating
                  ? "Generating..."
                  : "Start Interview"}
            </button>
          </section>
          {generationError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <p className="font-semibold text-red-700 dark:text-red-300 mb-2">
                Error Starting Interview
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {generationError}
              </p>
              <details className="mt-3 text-xs text-red-500 dark:text-red-400 cursor-pointer">
                <summary className="font-semibold">Debug Info</summary>
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                  <p>API Base: {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}</p>
                  <p>Backend: http://localhost:5000/api/interview/generate-questions</p>
                  <p>Please ensure backend is running</p>
                </div>
              </details>
            </div>
          )}

          <AppFooter />
        </div>
      </main>
    </div>
  );
};
