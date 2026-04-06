import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { NotificationBell } from "../components/NotificationBell";
import { PageClock } from "../components/PageClock";
import { PageControls } from "../components/PageControls";
import { Sidebar } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";
import { getValidImageSrc } from "../utils/profileImage";
import {
  Award,
  Zap,
  Briefcase,
  Target,
  TrendingUp,
  Star,
  Flame,
  Mic,
} from "lucide-react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profilePhoto = getValidImageSrc(localStorage.getItem("profilePhoto"));

  const formatNameCase = (value = "") =>
    `${value}`
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const questionsCount = 3;
  const firstName = useMemo(
    () => (user?.name ? formatNameCase(user.name.split(" ")[0]) : "There"),
    [user?.name],
  );

  const badges = [
    { name: "First Step", icon: Target, unlocked: true },
    {
      name: "Trending Up",
      icon: TrendingUp,
      unlocked: (user?.points || 0) > 10,
    },
    { name: "Top Performer", icon: Star, unlocked: (user?.points || 0) > 50 },
    { name: "On Fire", icon: Flame, unlocked: (user?.loginStreak || 0) >= 7 },
  ];

  const feedbackSummary = [
    {
      title: "Communication",
      text: "Your responses are clear. Add one specific real-world example in each answer.",
    },
    {
      title: "Technical Depth",
      text: "Strong fundamentals. Next step: explain trade-offs behind your technical decisions.",
    },
    {
      title: "Confidence",
      text: "Good momentum. Keep practicing to improve pace and storytelling structure.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <PageClock />

          <section className="rounded-2xl border border-teal-300/70 bg-gradient-to-r from-teal-500/90 via-emerald-300/90 to-cyan-200/90 px-6 py-5 shadow-md transition-all duration-300 dark:border-teal-800/40 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950 md:px-6 md:py-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <PageControls
                backFallbackTo="/"
                className="text-slate-900 dark:text-white"
              />
              <NotificationBell />
            </div>
            <div className="flex min-h-[164px] flex-col gap-3 md:min-h-[178px] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Profile Picture */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-teal-400 to-emerald-400 dark:border-slate-800 md:h-18 md:w-18">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-700/80 dark:text-teal-200">
                    Dashboard
                  </p>
                  <h1 className="text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-4xl">
                    Welcome back, {firstName}
                  </h1>
                  <p className="text-sm font-semibold text-slate-800 dark:text-teal-100">
                    {user?.role === "admin" ? "Admin" : "User"}
                  </p>
                  <p className="max-w-2xl text-slate-800/85 dark:text-white/80">
                    Track your progress, review AI insights, and continue
                    building interview confidence.
                  </p>
                </div>
              </div>

              {(user?.loginStreak || 0) > 0 && (
                <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-100 to-red-100 p-3 text-center dark:border-orange-800 dark:from-orange-900/30 dark:to-red-900/30">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <Flame
                      size={22}
                      className="text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {user?.loginStreak || 0}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400 mt-1">
                    Day Streak
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              icon={Zap}
              label="Total Points"
              value={user?.points || 0}
              color="teal"
            />
            <StatCard
              icon={Award}
              label="Current Level"
              value={user?.level || 1}
              color="blue"
            />
            <StatCard
              icon={Briefcase}
              label="Interviews Taken"
              value={user?.interviewsTaken || 0}
              color="slate"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <article
                    key={badge.name}
                    className={`rounded-2xl p-5 border transition-colors ${
                      badge.unlocked
                        ? "border-teal-300 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-900/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`rounded-xl p-2 ${
                          badge.unlocked
                            ? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {badge.name}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-teal-200 dark:border-teal-800/50 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-4 border-b-2 border-teal-100 dark:border-teal-900">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Start Your Next Interview
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                  Practice with {questionsCount} curated questions and receive
                  instant AI feedback.
                </p>
              </div>
              <button
                onClick={() => navigate("/interview-selection")}
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold px-6 py-3 transition-all hover:shadow-lg"
              >
                Begin Interview
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                  Voice Practice
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Improve spoken interview communication
                </h2>
                <p className="max-w-2xl text-slate-600 dark:text-slate-400">
                  Practice reading a paragraph or answer AI interview questions with
                  live speech-to-text, filler-word tracking, and instant feedback.
                </p>
              </div>
              <button
                onClick={() => navigate("/voice-practice")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Mic size={18} />
                Open Voice Practice
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-teal-200 dark:border-teal-800">
              AI Feedback Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackSummary.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <AppFooter />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
