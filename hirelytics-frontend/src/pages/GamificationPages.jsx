import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { PageHeader } from "../components/PageHeader";
import { PageClock } from "../components/PageClock";
import { Sidebar } from "../components/Sidebar";
import { Trophy, Star, Award, Medal } from "lucide-react";
import {
  LevelBadge,
  PointsDisplay,
  StreakCounter,
  AchievementCard,
  LeaderboardRow,
} from "../components/GamificationComponents";
import { API_BASE } from "../lib/api";
import { formatDisplayName } from "../utils/name";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.warn("No authentication token found. User may need to log in.");
          setStats(null);
          return;
        }

        const response = await fetch(`${API_BASE}/gamification/user-stats`, {
          headers: getAuthHeaders()
        });

        if (response.status === 401) {
          console.error("Authentication failed. Token may be invalid or expired.");
          localStorage.removeItem("token");
          setStats(null);
          return;
        }

        const data = await response.json();
        setStats(response.ok && data.success ? data.stats : null);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
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
        <main className="min-w-0 flex flex-1 items-center justify-center p-4 md:p-8">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Gamification"
            title={`${formatDisplayName(user?.name || "Your")} Profile`}
            description="View your achievements, points, streaks, and growth at a glance."
            icon={Trophy}
            backFallbackTo="/dashboard"
          />

          <div className="mx-auto w-full max-w-4xl space-y-8">

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

          <AppFooter />
          </div>
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
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.warn("No authentication token found. User may need to log in.");
          setLeaderboard([]);
          setYourRank(null);
          return;
        }

        const response = await fetch(
          `${API_BASE}/gamification/leaderboard?type=${leaderboardType}&limit=100`,
          { 
            headers: getAuthHeaders()
          },
        );
        
        if (response.status === 401) {
          console.error("Authentication failed. Token may be invalid or expired.");
          localStorage.removeItem("token");
          setLeaderboard([]);
          setYourRank(null);
          return;
        }

        const data = await response.json();
        if (response.ok && data.success) {
          setLeaderboard(data.leaderboard || []);
          setYourRank(data.yourRank || null);
        } else {
          console.error("Failed to fetch leaderboard:", data);
          setLeaderboard([]);
          setYourRank(null);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
        setYourRank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType]);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Gamification"
            title="Leaderboard"
            description="Track top performers, compare your rank, and stay motivated with every practice session."
            icon={Medal}
            backFallbackTo="/dashboard"
          />

          <div className="mx-auto w-full max-w-4xl space-y-8">

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

          <AppFooter />
          </div>
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
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.warn("No authentication token found. User may need to log in.");
          setAchievements({});
          return;
        }

        const response = await fetch(`${API_BASE}/gamification/achievements`, {
          headers: getAuthHeaders()
        });

        if (response.status === 401) {
          console.error("Authentication failed. Token may be invalid or expired.");
          localStorage.removeItem("token");
          setAchievements({});
          return;
        }

        const data = await response.json();
        setAchievements(response.ok && data.success ? data.achievements : {});
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAchievements({});
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
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Gamification"
            title="Achievements"
            description="Review unlocked milestones and discover what to chase next."
            icon={Award}
            backFallbackTo="/dashboard"
          />

          <div className="mx-auto w-full max-w-4xl space-y-8">

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

          <AppFooter />
          </div>
        </div>
      </main>
    </div>
  );
};
