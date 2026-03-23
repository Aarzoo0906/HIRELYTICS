import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { Trophy, Star, Award, Medal } from "lucide-react";
import {
  LevelBadge,
  PointsDisplay,
  StreakCounter,
  AchievementCard,
  LeaderboardRow,
} from "../components/GamificationComponents";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/gamification/user-stats`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setStats(response.ok && data.success ? data.stats : null);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {user?.name}'s Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View your achievements and progress
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LevelBadge
              level={stats?.currentLevel}
              points={stats?.progressToNextLevel}
              nextLevelReq={stats?.nextLevelRequirement}
            />
            <PointsDisplay points={stats?.totalPoints} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StreakCounter
              currentStreak={stats?.streaks?.currentLoginStreak}
              bestStreak={stats?.streaks?.bestLoginStreak}
            />
            <StreakCounter
              currentStreak={stats?.streaks?.currentInterviewStreak}
              bestStreak={stats?.streaks?.bestInterviewStreak}
            />
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <Trophy
                className="text-teal-600 dark:text-teal-400 mb-3"
                size={24}
              />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Interviews
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stats?.stats?.totalInterviews || 0}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <Star className="text-amber-600 dark:text-amber-400 mb-3" size={24} />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Perfect Answers
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stats?.stats?.perfectAnswers || 0}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <Award
                className="text-purple-600 dark:text-purple-400 mb-3"
                size={24}
              />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Avg Score
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stats?.stats?.averageScore || 0}%
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Achievements ({stats?.achievements?.length || 0})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.achievements?.slice(0, 6).map((ach) => (
                <AchievementCard key={ach.id} achievement={ach} unlocked />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [yourRank, setYourRank] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState("allTime");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}/gamification/leaderboard?type=${leaderboardType}&limit=100`,
          { headers: getAuthHeaders() },
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setLeaderboard(data.leaderboard || []);
          setYourRank(data.yourRank || null);
        } else {
          setLeaderboard([]);
          setYourRank(null);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType]);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Medal className="text-amber-600" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Leaderboard
              </h1>
            </div>
          </section>

          <div className="flex gap-2">
            {["allTime", "weekly", "daily"].map((type) => (
              <button
                key={type}
                onClick={() => setLeaderboardType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  leaderboardType === type
                    ? "bg-teal-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {type === "allTime"
                  ? "All Time"
                  : type === "weekly"
                    ? "This Week"
                    : "Today"}
              </button>
            ))}
          </div>

          {yourRank && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-2 border-teal-500 dark:border-teal-400">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Your Rank
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                #{yourRank.rank}
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                Loading leaderboard...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <LeaderboardRow
                  key={entry.rank}
                  rank={entry.rank}
                  name={entry.name}
                  points={entry.points}
                  level={entry.level}
                  interviews={entry.interviews}
                  isCurrentUser={entry.isCurrentUser}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export const Achievements = () => {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/gamification/achievements`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setAchievements(response.ok && data.success ? data.achievements : null);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const renderTier = (tierName, tierAchievements) => (
    <section
      key={tierName}
      className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize mb-4">
        {tierName} Achievements ({tierAchievements.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tierAchievements.map((ach) => (
          <AchievementCard key={ach.id} achievement={ach} unlocked={ach.unlocked} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-purple-600" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Achievements
              </h1>
            </div>
          </section>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                Loading achievements...
              </p>
            </div>
          ) : achievements ? (
            <div className="space-y-8">
              {Object.entries(achievements).map(([tier, achs]) =>
                renderTier(tier, achs),
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};
