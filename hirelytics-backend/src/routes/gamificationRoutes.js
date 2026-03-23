import express from "express";
import {
  calculatePoints,
  getUserStats,
  checkAchievements,
  getLeaderboard,
  getAllAchievements,
  updateLoginStreak,
  getChallenges,
} from "../controllers/gamificationController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/calculate-points", authMiddleware, calculatePoints);
router.get("/user-stats", authMiddleware, getUserStats);
router.post("/check-achievements", authMiddleware, checkAchievements);
router.get("/leaderboard", authMiddleware, getLeaderboard);
router.get("/achievements", authMiddleware, getAllAchievements);
router.post("/login-streak", authMiddleware, updateLoginStreak);
router.get("/challenges", authMiddleware, getChallenges);

export default router;
