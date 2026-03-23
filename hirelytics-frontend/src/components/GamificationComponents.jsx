import { useEffect, useState } from "react";

// components/gamification/LevelBadge.jsx
import { Trophy } from "lucide-react";

export const LevelBadge = ({ level = 1, points = 0, nextLevelReq = 100 }) => {
  const getLevelName = (lvl) => {
    if (lvl <= 5) return "Novice";
    if (lvl <= 10) return "Beginner";
    if (lvl <= 20) return "Intermediate";
    if (lvl <= 30) return "Advanced";
    if (lvl <= 40) return "Expert";
    return "Legend";
  };

  const getLevelColor = (lvl) => {
    if (lvl <= 5) return "bg-slate-500";
    if (lvl <= 10) return "bg-emerald-500";
    if (lvl <= 20) return "bg-blue-500";
    if (lvl <= 30) return "bg-purple-500";
    if (lvl <= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full ${getLevelColor(level)} flex items-center justify-center`}
        >
          <Trophy className="text-white" size={32} />
        </div>
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Current Level
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Level {level}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {getLevelName(level)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {points} / {nextLevelReq} points
          </span>
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
            {Math.round((points / nextLevelReq) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (points / nextLevelReq) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// components/gamification/PointsDisplay.jsx
import { Sparkles } from "lucide-react";

export const PointsDisplay = ({ points = 0, newPoints = null }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800">
      <Sparkles className="text-teal-600 dark:text-teal-400" size={20} />
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">Points</p>
        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
          {points}
        </p>
      </div>
      {newPoints && (
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            +{newPoints}
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            earned
          </p>
        </div>
      )}
    </div>
  );
};

// components/gamification/AchievementCard.jsx
import { Lock } from "lucide-react";

export const AchievementCard = ({ achievement, unlocked = false }) => {
  const tierColors = {
    bronze: "bg-amber-100 dark:bg-amber-900/30 border-amber-300",
    silver: "bg-slate-100 dark:bg-slate-800 border-slate-300",
    gold: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300",
    platinum: "bg-purple-100 dark:bg-purple-900/30 border-purple-300",
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        unlocked
          ? tierColors[achievement.tier]
          : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">
          {unlocked ? "✅" : <Lock size={24} className="text-slate-400" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {achievement.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {achievement.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded capitalize bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {achievement.tier}
            </span>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              +{achievement.points} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// components/gamification/LeaderboardRow.jsx
export const LeaderboardRow = ({
  rank,
  name,
  points,
  level,
  interviews,
  isCurrentUser = false,
}) => {
  const getMedalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 flex items-center gap-4 ${
        isCurrentUser
          ? "border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 w-12 text-center">
        {getMedalEmoji(rank)}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {interviews} interviews • Level {level}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
          {points}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">points</p>
      </div>

      {isCurrentUser && (
        <div className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">
          You
        </div>
      )}
    </div>
  );
};

// components/gamification/StreakCounter.jsx
import { Flame } from "lucide-react";

export const StreakCounter = ({ currentStreak = 0, bestStreak = 0 }) => {
  return (
    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="text-orange-600 dark:text-orange-400" size={24} />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Interview Streak
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">Current</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">Best</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {bestStreak}
          </p>
        </div>
      </div>
    </div>
  );
};

// components/gamification/ChallengeCard.jsx
import { Target } from "lucide-react";

export const ChallengeCard = ({
  challenge,
  progress = 0,
  completed = false,
}) => {
  const progressPercent = Math.min(
    100,
    (progress / challenge.requirement) * 100,
  );

  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        completed
          ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{challenge.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            {challenge.name}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {challenge.description}
          </p>
        </div>
        {completed && (
          <div className="text-emerald-600 dark:text-emerald-400">✅</div>
        )}
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {progress} / {challenge.requirement}
        </span>
        <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
          +{challenge.reward} pts
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

// components/gamification/ConfettiAnimation.jsx
export const ConfettiAnimation = ({ active = false, onComplete }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!active) return;

    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      rotation: Math.random() * 360,
    }));

    setConfetti(pieces);
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 bg-teal-500 rounded-full animate-bounce"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            animation: `fall ${piece.duration}s linear forwards`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// components/gamification/InterviewResultCard.jsx
export const InterviewResultCard = ({
  score,
  difficulty,
  pointsEarned,
  bonuses,
  levelUp,
}) => {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-800">
      <div className="text-center mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Interview Score
        </p>
        <div className="text-6xl font-bold text-teal-600 dark:text-teal-400">
          {score}
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {score >= 85
            ? "🌟 Perfect!"
            : score >= 60
              ? "👍 Great job!"
              : "💪 Keep practicing!"}
        </p>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
          <span className="text-slate-600 dark:text-slate-400">
            Base Points
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {pointsEarned - Object.values(bonuses).reduce((a, b) => a + b, 0)}
          </span>
        </div>
        {Object.entries(bonuses).map(
          ([key, value]) =>
            value > 0 && (
              <div
                key={key}
                className="flex justify-between p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
              >
                <span className="text-slate-600 dark:text-slate-400 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{value}
                </span>
              </div>
            ),
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-teal-500 dark:border-teal-400">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Total Points Earned
        </p>
        <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
          +{pointsEarned}
        </p>
      </div>

      {levelUp && (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border-2 border-amber-500 dark:border-amber-400 text-center">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            🎉 Level Up! 🎉
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            You've reached a new level!
          </p>
        </div>
      )}
    </div>
  );
};

export default {
  LevelBadge,
  PointsDisplay,
  AchievementCard,
  LeaderboardRow,
  StreakCounter,
  ChallengeCard,
  ConfettiAnimation,
  InterviewResultCard,
};
