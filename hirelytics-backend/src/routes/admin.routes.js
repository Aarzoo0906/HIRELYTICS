import express from "express";
import {
  broadcastAnnouncement,
  getSystemStats,
  getUsersUsage,
} from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, getSystemStats);
router.get("/users", authMiddleware, adminMiddleware, getUsersUsage);
router.post("/broadcast", authMiddleware, adminMiddleware, broadcastAnnouncement);

export default router;
