import express from "express";
import {
  getProfile,
  getDashboard,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.get("/dashboard", authMiddleware, getDashboard);

export default router;