import { useLocation, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { PageClock } from "../components/PageClock";
import { PageHeader } from "../components/PageHeader";
import { Sidebar } from "../components/Sidebar";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Share2,
  Download,
  Twitter,
  Linkedin,
} from "lucide-react";
import jsPDF from "jspdf";
import { useState, useEffect, useMemo } from "react";
import { InterviewResultCard } from "../components/GamificationComponents";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { analyzeInterviewPerformance } from "../utils/interviewAnalysis";

export const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    score = 0,
    answers = {},
    questions = [],
    interviewType,
    difficulty,
    isTimeUp,
    analysis: initialAnalysis,
  } = location.state || {};
  const [shareSuccess, setShareSuccess] = useState(false);
  const [gamificationData, setGamificationData] = useState(null);
  const { user, updateUser } = useAuth();

  const getPerformanceLevel = (score) => {
    if (score >= 80)
      return {
        level: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    if (score >= 60)
      return { level: "Good", color: "text-teal-600 dark:text-teal-400" };
    if (score >= 40)
      return { level: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { level: "Needs Work", color: "text-red-600 dark:text-red-400" };
  };

  const analysis = useMemo(
    () => initialAnalysis || analyzeInterviewPerformance({ answers, questions }),
    [answers, initialAnalysis, questions],
  );

  const stableScore =
    Number.isFinite(score) && score > 0
      ? Math.round(score)
      : analysis?.overallScore ?? 0;
  const performance = getPerformanceLevel(stableScore);

  useEffect(() => {
    const syncGamification = async () => {
      const token = localStorage.getItem("token");
      if (!token || !difficulty) return;

      try {
        const pointsRes = await fetch(`${API_BASE}/gamification/calculate-points`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: stableScore,
            difficulty,
            timeTaken: null,
          }),
        });
        const pointsData = await pointsRes.json();

        if (pointsRes.ok && pointsData.success) {
          setGamificationData({
            pointsEarned: pointsData.pointsEarned || 0,
            bonuses: pointsData.bonuses || {},
            levelUp: Boolean(pointsData.newLevel),
          });

          updateUser({
            ...user,
            points: pointsData.totalPoints ?? user?.points ?? 0,
            totalPoints: pointsData.totalPoints ?? user?.totalPoints ?? 0,
            level: pointsData.currentLevel ?? user?.level ?? 1,
            currentLevelPoints:
              pointsData.progressToNextLevel ?? user?.currentLevelPoints ?? 0,
          });
        }

        await fetch(`${API_BASE}/gamification/check-achievements`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Gamification sync failed:", error);
      }
    };

    syncGamification();
  }, [API_BASE, difficulty, stableScore]);

  const feedbackItems = analysis.metrics.map((item) => ({
    ...item,
    icon:
      item.title === "Answer Completeness"
        ? CheckCircle
        : item.title === "Communication Clarity"
          ? TrendingUp
          : AlertCircle,
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(24);
    doc.text("Interview Report", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Type: ${interviewType.toUpperCase()} - ${difficulty.toUpperCase()}`,
      20,
      yPosition,
    );
    yPosition += 15;

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(`Score: ${stableScore}/100`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Performance: ${performance.level}`, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Questions & Answers:", 20, yPosition);
    yPosition += 10;

    questions.forEach((q, index) => {
      doc.setFontSize(11);
      doc.setTextColor(0);
      const questionText = `Q${index + 1}: ${q.title}`;
      const wrappedQuestion = doc.splitTextToSize(questionText, pageWidth - 40);
      doc.text(wrappedQuestion, 20, yPosition);
      yPosition += wrappedQuestion.length * 5 + 5;

      doc.setFontSize(10);
      doc.setTextColor(100);
      const answerText = `A: ${answers[index] || "No answer provided"}`;
      const wrappedAnswer = doc.splitTextToSize(answerText, pageWidth - 40);
      doc.text(wrappedAnswer, 20, yPosition);
      yPosition += wrappedAnswer.length * 5 + 10;

      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save(`interview_report_${Date.now()}.pdf`);
  };

  const handleShareTwitter = () => {
    const text = `🎉 Just completed a ${difficulty} ${interviewType} interview on Hirelytics! Scored ${stableScore}/100. Ready to ace that interview! 💪 #InterviewPrep #Hirelytics`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const text = `I just completed a ${difficulty} level ${interviewType} interview on Hirelytics and scored ${stableScore}/100! Continuously improving my interview skills. #InterviewPrep #CareerDevelopment`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=hirelytics.com&title=Interview Results&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleCopyLink = () => {
    const text = `I scored ${stableScore}/100 on a ${difficulty} ${interviewType} interview using Hirelytics!`;
    navigator.clipboard.writeText(text);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageClock />
          <PageHeader
            eyebrow="Interview Summary"
            title="Interview Complete!"
            description="Here is your performance summary and improvement breakdown from this round."
            icon={CheckCircle}
            backFallbackTo="/interview-selection"
          />
          <section className="rounded-3xl border border-slate-200 bg-white px-8 py-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Your Score
            </h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              Here's your performance summary.
            </p>

            {isTimeUp && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-orange-800 dark:text-orange-200 font-semibold">
                  ⏰ You ran out of time on the last question
                </p>
              </div>
            )}

            <div className="mb-8">
              <div className="inline-flex items-baseline gap-4">
                <span className={`text-7xl font-bold ${performance.color}`}>
                  {stableScore}
                </span>
                <span className="text-3xl font-semibold text-slate-500 dark:text-slate-400">
                  / 100
                </span>
              </div>
              <p className={`text-2xl font-semibold mt-4 ${performance.color}`}>
                {performance.level}
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Great effort! Review the feedback below to improve your future
              interviews.
            </p>
            </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b-2 border-teal-200 dark:border-teal-800">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <Icon
                        size={20}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {item.score}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {gamificationData && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Gamification Rewards
              </h2>
              <InterviewResultCard
                score={stableScore}
                difficulty={difficulty}
                pointsEarned={gamificationData.pointsEarned}
                bonuses={gamificationData.bonuses}
                levelUp={gamificationData.levelUp}
              />
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              AI Feedback
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Strengths
                </h3>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                  {analysis.strengths.length > 0 ? (
                    analysis.strengths.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>Complete more answers to unlock tailored strengths.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Areas to Improve
                </h3>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                  {analysis.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Share Your Achievement
            </h2>
            {shareSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
                  ✓ Copied/Shared successfully!
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Twitter size={18} />
                Share on Twitter
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <Linkedin size={18} />
                Share on LinkedIn
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Share2 size={18} />
                Copy Text
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>
          </section>

          <section className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/interview-selection")}
              className="flex-1 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Take Another Interview
            </button>
          </section>

          <AppFooter />
        </div>
      </main>
    </div>
  );
};
