import express from "express";
import {
  register,
  login,
  verify,
  changePassword,
  updateSessionTime,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authMiddleware, verify);
router.post("/change-password", authMiddleware, changePassword);
router.put("/session-time", authMiddleware, updateSessionTime);

export default router;
