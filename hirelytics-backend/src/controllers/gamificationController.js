import User from "../models/User.js";
import { formatDisplayName } from "../utils/nameFormat.js";

// Constants
const POINTS_CONFIG = {
  easy: {
    0: 10,
    40: 15,
    60: 20,
    80: 25,
  },
  medium: {
    0: 20,
    40: 30,
    60: 40,
    80: 50,
  },
  hard: {
    0: 30,
    40: 45,
    60: 60,
    80: 100,
  },
};

const BONUSES = {
  perfectAnswer: 25,
  firstTry: 15,
  speedrun: 20,
  comeback: 30,
};

const LEVEL_REQUIREMENTS = {
  1: 100,
  2: 250,
  3: 450,
  4: 700,
  5: 1000,
  6: 1400,
  7: 1900,
  8: 2500,
  9: 3200,
  10: 4000,
};

const ACHIEVEMENTS = [
  {
    id: "first_interview",
    name: "First Steps",
    description: "Complete your first interview",
    requirement: 1,
    tier: "bronze",
    points: 10,
  },
  {
    id: "five_interviews",
    name: "Interview Starter",
    description: "Complete 5 interviews",
    requirement: 5,
    tier: "bronze",
    points: 25,
  },
  {
    id: "perfect_answer",
    name: "Perfect Answer",
    description: "Score 90+ on any question",
    requirement: 1,
    tier: "bronze",
    points: 15,
  },
  {
    id: "perfect_session",
    name: "Perfect Session",
    description: "Score 85+ on all 5 questions in one interview",
    requirement: 1,
    tier: "silver",
    points: 50,
  },
  {
    id: "twenty_five_interviews",
    name: "Interview Warrior",
    description: "Complete 25 interviews",
    requirement: 25,
    tier: "silver",
    points: 50,
  },
  {
    id: "fifty_interviews",
    name: "Interview Legend",
    description: "Complete 50 interviews",
    requirement: 50,
    tier: "gold",
    points: 100,
  },
  {
    id: "hundred_interviews",
    name: "Interview God",
    description: "Complete 100 interviews",
    requirement: 100,
    tier: "platinum",
    points: 250,
  },
  {
    id: "seven_day_streak",
    name: "Week Warrior",
    description: "Login 7 days in a row",
    requirement: 7,
    tier: "silver",
    points: 50,
  },
  {
    id: "thirty_day_streak",
    name: "Streak King",
    description: "Login 30 days in a row",
    requirement: 30,
    tier: "gold",
    points: 100,
  },
];

/* ===============================
   CALCULATE POINTS
================================= */
export const calculatePoints = async (req, res, next) => {
  try {
    const {
      score,
      difficulty,
      isFirstTry = false,
      timeTaken = null,
    } = req.body;
    const userId = req.userId;

    if (!score || !difficulty) {
      return res.status(400).json({ message: "Score and difficulty required" });
    }

    let basePoints = 0;
    const diffConfig = POINTS_CONFIG[difficulty];

    if (score >= 80) basePoints = diffConfig[80];
    else if (score >= 60) basePoints = diffConfig[60];
    else if (score >= 40) basePoints = diffConfig[40];
    else basePoints = diffConfig[0];

    let totalPoints = basePoints;

    if (score >= 85) {
      totalPoints += BONUSES.perfectAnswer;
    }

    if (isFirstTry) {
      totalPoints += BONUSES.firstTry;
    }

    if (timeTaken && timeTaken < 300) {
      totalPoints += BONUSES.speedrun;
    }

    const user = await User.findById(userId);

    const existingTotalPoints = user.totalPoints || user.points || 0;
    user.totalPoints = existingTotalPoints + totalPoints;
    user.points = user.totalPoints;

    const nextLevelReq =
      LEVEL_REQUIREMENTS[user.level + 1] ||
      LEVEL_REQUIREMENTS[user.level] * 1.5;
    user.currentLevelPoints = (user.currentLevelPoints || 0) + totalPoints;

    let leveledUp = false;
    while (user.currentLevelPoints >= nextLevelReq && user.level < 50) {
      user.level += 1;
      user.currentLevelPoints -= nextLevelReq;
      leveledUp = true;
    }

    user.interviewStreak = user.interviewStreak || {};
    const today = new Date().toDateString();
    const lastDate = user.interviewStreak.lastInterviewDate?.toDateString?.();

    if (lastDate !== today) {
      user.interviewStreak.current = (user.interviewStreak.current || 0) + 1;
      user.interviewStreak.lastInterviewDate = new Date();
      if (user.interviewStreak.current > user.interviewStreak.best) {
        user.interviewStreak.best = user.interviewStreak.current;
      }
    }

    user.stats = user.stats || {};
    user.stats.totalInterviews = (user.stats.totalInterviews || 0) + 1;
    if (score >= 85) {
      user.stats.perfectAnswers = (user.stats.perfectAnswers || 0) + 1;
    }
    user.stats.averageScore = Math.round(
      ((user.stats.averageScore || 0) * (user.stats.totalInterviews - 1) +
        score) /
        user.stats.totalInterviews,
    );

    await user.save();

    res.status(200).json({
      success: true,
      pointsEarned: totalPoints,
      basePoints,
      bonuses: {
        perfectAnswer: score >= 85 ? BONUSES.perfectAnswer : 0,
        firstTry: isFirstTry ? BONUSES.firstTry : 0,
        speedrun: timeTaken && timeTaken < 300 ? BONUSES.speedrun : 0,
      },
      newLevel: leveledUp ? user.level : null,
      totalPoints: user.totalPoints,
      currentLevel: user.level,
      progressToNextLevel: user.currentLevelPoints,
      streakBonus: user.interviewStreak.current * 5,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET USER STATS
================================= */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "totalPoints level currentLevelPoints stats interviewStreak loginStreak achievements",
    );

    const nextLevelReq =
      LEVEL_REQUIREMENTS[user.level + 1] ||
      LEVEL_REQUIREMENTS[user.level] * 1.5;

    const stats = {
      totalPoints: user.totalPoints || user.points || 0,
      currentLevel: user.level || 1,
      progressToNextLevel: user.currentLevelPoints || 0,
      nextLevelRequirement: nextLevelReq,
      progressPercentage: Math.round(
        ((user.currentLevelPoints || 0) / nextLevelReq) * 100,
      ),
      stats: {
        totalInterviews: user.stats?.totalInterviews || 0,
        perfectAnswers: user.stats?.perfectAnswers || 0,
        averageScore: user.stats?.averageScore || 0,
      },
      streaks: {
        currentLoginStreak: user.loginStreak?.current || 0,
        bestLoginStreak: user.loginStreak?.best || 0,
        currentInterviewStreak: user.interviewStreak?.current || 0,
        bestInterviewStreak: user.interviewStreak?.best || 0,
      },
      achievements: user.achievements || [],
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CHECK & AWARD ACHIEVEMENTS
================================= */
export const checkAchievements = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
      const hasAchievement = user.achievements?.some(
        (a) => a.id === achievement.id,
      );

      if (hasAchievement) continue;

      let shouldUnlock = false;

      switch (achievement.id) {
        case "first_interview":
        case "five_interviews":
        case "twenty_five_interviews":
        case "fifty_interviews":
        case "hundred_interviews":
          shouldUnlock =
            (user.stats?.totalInterviews || 0) >= achievement.requirement;
          break;
        case "perfect_answer":
          shouldUnlock =
            (user.stats?.perfectAnswers || 0) >= achievement.requirement;
          break;
        case "perfect_session":
          shouldUnlock =
            (user.stats?.perfectAnswers || 0) >= achievement.requirement;
          break;
        case "seven_day_streak":
        case "thirty_day_streak":
          shouldUnlock =
            (user.loginStreak?.current || 0) >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        user.achievements = user.achievements || [];
        user.achievements.push({
          id: achievement.id,
          name: achievement.name,
          unlockedAt: new Date(),
        });

        user.totalPoints += achievement.points;

        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    res.status(200).json({
      success: true,
      newAchievements,
      totalAchievements: user.achievements?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET LEADERBOARD
================================= */
export const getLeaderboard = async (req, res, next) => {
  try {
    const { type = "allTime", limit = 100 } = req.query;
    const userId = req.userId;

    let users = [];

    if (type === "allTime" || type === "daily") {
      users = await User.find()
        .select("name email totalPoints points level stats")
        .sort({ totalPoints: -1, points: -1 })
        .limit(parseInt(limit));
    } else if (type === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      users = await User.find()
        .select("name email totalPoints points level stats")
        .sort({ totalPoints: -1, points: -1 })
        .limit(parseInt(limit));
    }

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: formatDisplayName(user.name),
      email: user.email,
      points: user.totalPoints || user.points || 0,
      level: user.level || 1,
      interviews: user.stats?.totalInterviews || 0,
      isCurrentUser: user._id.toString() === userId.toString(),
    }));

    const currentUserRank = leaderboard.find((entry) => entry.isCurrentUser);

    res.status(200).json({
      success: true,
      leaderboard,
      yourRank: currentUserRank,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET ALL ACHIEVEMENTS
================================= */
export const getAllAchievements = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("achievements");

    const unlockedIds = user.achievements?.map((a) => a.id) || [];

    const achievementsList = ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      unlockedAt:
        user.achievements?.find((a) => a.id === achievement.id)?.unlockedAt ||
        null,
    }));

    const grouped = {
      bronze: achievementsList.filter((a) => a.tier === "bronze"),
      silver: achievementsList.filter((a) => a.tier === "silver"),
      gold: achievementsList.filter((a) => a.tier === "gold"),
      platinum: achievementsList.filter((a) => a.tier === "platinum"),
    };

    res.status(200).json({
      success: true,
      total: ACHIEVEMENTS.length,
      unlocked: unlockedIds.length,
      achievements: grouped,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   UPDATE LOGIN STREAK
================================= */
export const updateLoginStreak = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    user.loginStreak = user.loginStreak || { current: 0, best: 0 };

    const today = new Date().toDateString();
    const lastLoginDate = user.loginStreak.lastLoginDate?.toDateString?.();

    if (lastLoginDate !== today) {
      if (lastLoginDate === new Date(Date.now() - 86400000).toDateString()) {
        user.loginStreak.current += 1;
      } else {
        user.loginStreak.current = 1;
      }

      user.loginStreak.lastLoginDate = new Date();

      if (user.loginStreak.current > user.loginStreak.best) {
        user.loginStreak.best = user.loginStreak.current;
      }

      await user.save();
    }

    res.status(200).json({
      success: true,
      currentStreak: user.loginStreak.current,
      bestStreak: user.loginStreak.best,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET CHALLENGES
================================= */
export const getChallenges = async (req, res, next) => {
  try {
    const challenges = [
      {
        id: "five_interviews",
        name: "5 Interview Challenge",
        description: "Complete 5 interviews this week",
        requirement: 5,
        type: "weekly",
        reward: 100,
        icon: "📚",
      },
      {
        id: "all_topics",
        name: "Topic Explorer",
        description: "Interview in all 6 topics this week",
        requirement: 6,
        type: "weekly",
        reward: 150,
        icon: "🌍",
      },
      {
        id: "perfect_week",
        name: "Perfect Week",
        description: "Score 80+ on all interviews this week",
        requirement: 3,
        type: "weekly",
        reward: 200,
        icon: "⭐",
      },
      {
        id: "speedrun",
        name: "Speed Runner",
        description: "Complete 3 interviews in under 5 min each",
        requirement: 3,
        type: "weekly",
        reward: 150,
        icon: "⚡",
      },
      {
        id: "hard_difficulty",
        name: "Difficulty Climber",
        description: "Interview on Hard difficulty 5 times",
        requirement: 5,
        type: "weekly",
        reward: 200,
        icon: "🔥",
      },
    ];

    res.status(200).json({
      success: true,
      challenges,
    });
  } catch (error) {
    next(error);
  }
};
