import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";
import {
  Award,
  Zap,
  Briefcase,
  Target,
  TrendingUp,
  Star,
  Flame,
} from "lucide-react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profilePhoto = localStorage.getItem("profilePhoto");

  const questionsCount = 3;
  const firstName = useMemo(
    () => (user?.name ? user.name.split(" ")[0] : "there"),
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

      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Profile Picture */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white dark:border-slate-800">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Dashboard
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Welcome back, {firstName}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                    Track your progress, review AI insights, and continue
                    building interview confidence.
                  </p>
                </div>
              </div>

              {(user?.loginStreak || 0) > 0 && (
                <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame
                      size={24}
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

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
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
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold px-6 py-3 transition-colors"
              >
                Begin Interview
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              AI Feedback Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackSummary.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
