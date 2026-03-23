import express from "express";
import { getSystemStats } from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Basic admin protection can be improved later
router.get("/stats", authMiddleware, getSystemStats);

export default router;