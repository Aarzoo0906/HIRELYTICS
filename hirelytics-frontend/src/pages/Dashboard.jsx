import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { NotificationBell } from "../components/NotificationBell";
import { PageClock } from "../components/PageClock";
import { PageControls } from "../components/PageControls";
import { Sidebar } from "../components/Sidebar";
import { formatDisplayName } from "../utils/name";
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

  const questionsCount = 3;
  const firstName = useMemo(
    () => (user?.name ? formatDisplayName(user.name.split(" ")[0]) : "There"),
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

  const dashboardStats = [
    {
      icon: Zap,
      label: "Total Points",
      value: user?.points || 0,
      iconClass:
        "bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_48%,#1d4ed8_100%)] text-white shadow-lg shadow-cyan-500/30",
      accentClass: "from-cyan-400/18 via-sky-500/10 to-white",
    },
    {
      icon: Award,
      label: "Current Level",
      value: user?.level || 1,
      iconClass:
        "bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_56%,#1e3a8a_100%)] text-white shadow-lg shadow-blue-500/30",
      accentClass: "from-sky-400/18 via-blue-500/10 to-white",
    },
    {
      icon: Briefcase,
      label: "Interviews Taken",
      value: user?.interviewsTaken || 0,
      iconClass:
        "bg-[linear-gradient(135deg,#06b6d4_0%,#0284c7_50%,#1d4ed8_100%)] text-white shadow-lg shadow-cyan-500/30",
      accentClass: "from-cyan-400/18 via-blue-500/10 to-white",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_24%),linear-gradient(180deg,#edfaff_0%,#f3faff_34%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_24%),linear-gradient(180deg,#020617_0%,#06152f_34%,#0f172a_100%)]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <PageClock />

          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.35),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.32),transparent_20%),linear-gradient(135deg,#020617_0%,#082f49_20%,#0f3f7d_48%,#1d4ed8_72%,#22d3ee_100%)] px-6 py-5 shadow-[0_40px_110px_-42px_rgba(14,165,233,0.6)] transition-all duration-300 md:px-7 md:py-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <PageControls
                backFallbackTo="/"
                className="text-white"
              />
              <NotificationBell />
            </div>
            <div className="flex min-h-[164px] flex-col gap-3 md:min-h-[178px] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Profile Picture */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/85 bg-gradient-to-br from-white via-sky-100 to-blue-200 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.8)] md:h-18 md:w-18 dark:border-cyan-200/30 dark:from-slate-900 dark:via-sky-950 dark:to-blue-900">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-blue-700">
                      {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/95">
                    Dashboard
                  </p>
                  <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                    Welcome back, {firstName}
                  </h1>
                  <p className="text-sm font-semibold text-cyan-100">
                    {user?.role === "admin" ? "Admin" : "User"}
                  </p>
                  <p className="max-w-2xl text-cyan-50/84">
                    Track your progress, review AI insights, and continue
                    building interview confidence.
                  </p>
                </div>
              </div>

              {(user?.loginStreak || 0) > 0 && (
                <div className="rounded-2xl border border-cyan-200/20 bg-slate-950/24 p-4 text-center text-white shadow-[0_24px_50px_-22px_rgba(6,182,212,0.42)] backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <Flame size={22} className="text-cyan-200" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {user?.loginStreak || 0}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/90">
                    Day Streak
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className={`relative overflow-hidden rounded-[1.7rem] border border-cyan-100/80 bg-[linear-gradient(145deg,#ffffff_0%,#f2fbff_45%,#edf8ff_100%)] p-6 shadow-[0_24px_70px_-46px_rgba(8,145,178,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_32px_86px_-42px_rgba(14,165,233,0.26)] dark:border-cyan-400/15 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(8,47,73,0.92)_45%,rgba(15,23,42,0.95)_100%)] dark:shadow-[0_28px_80px_-44px_rgba(8,145,178,0.3)] dark:hover:border-cyan-300/30`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.accentClass} pointer-events-none`}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700/85 dark:text-cyan-200/90">
                        {stat.label}
                      </p>
                      <p className="mt-4 text-4xl font-bold leading-none text-slate-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`rounded-2xl p-3 ${stat.iconClass}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
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
                        ? "border-cyan-200 bg-[linear-gradient(135deg,#ecfeff_0%,#dbeafe_100%)] shadow-[0_18px_50px_-36px_rgba(14,165,233,0.28)] dark:border-cyan-300/20 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.88)_0%,rgba(30,64,175,0.58)_100%)] dark:shadow-[0_20px_60px_-40px_rgba(14,165,233,0.36)]"
                        : "border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`rounded-xl p-2 ${
                          badge.unlocked
                            ? "bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {badge.name}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-cyan-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#eefbff_58%,#d9f5ff_100%)] p-6 shadow-[0_24px_70px_-48px_rgba(14,165,233,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-42px_rgba(6,182,212,0.24)] md:p-8 dark:border-cyan-300/20 dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.94)_0%,rgba(8,47,73,0.9)_58%,rgba(15,23,42,0.94)_100%)] dark:shadow-[0_28px_76px_-44px_rgba(8,145,178,0.32)]">
            <div className="flex flex-col gap-5 border-b border-cyan-100 pb-4 md:flex-row md:items-end md:justify-between dark:border-cyan-300/10">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Start Your Next Interview
                </h2>
                <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                  Practice with {questionsCount} curated questions and receive
                  instant AI feedback.
                </p>
              </div>
              <button
                onClick={() => navigate("/interview-selection")}
                className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0891b2_0%,#2563eb_58%,#22d3ee_100%)] px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Begin Interview
              </button>
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(240,252,255,0.95)_48%,rgba(224,242,254,0.94)_100%)] p-6 shadow-[0_24px_70px_-48px_rgba(6,182,212,0.18)] backdrop-blur dark:border-cyan-300/15 dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.95)_0%,rgba(8,47,73,0.92)_48%,rgba(15,23,42,0.9)_100%)] dark:shadow-[0_28px_76px_-42px_rgba(6,182,212,0.28)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-200">
                  Voice Practice
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Improve spoken interview communication
                </h2>
                <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                  Practice reading a paragraph or answer AI interview questions with
                  live speech-to-text, filler-word tracking, and instant feedback.
                </p>
              </div>
              <button
                onClick={() => navigate("/voice-practice")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_40%,#2563eb_100%)] px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <Mic size={18} />
                Open Voice Practice
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-cyan-100 pb-3 text-xl font-bold text-slate-900 md:text-2xl dark:border-cyan-300/10 dark:text-white">
              AI Feedback Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackSummary.map((item) => (
                <article
                  key={item.title}
                  className="cursor-pointer rounded-[1.6rem] border border-cyan-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fbff_100%)] p-5 shadow-[0_20px_55px_-44px_rgba(6,182,212,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_60px_-40px_rgba(14,165,233,0.24)] dark:border-cyan-300/15 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96)_0%,rgba(8,47,73,0.84)_100%)] dark:shadow-[0_24px_60px_-40px_rgba(8,145,178,0.28)] dark:hover:border-cyan-300/25"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
