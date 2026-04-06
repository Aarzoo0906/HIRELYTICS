import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  clearAllNotifications,
  deleteNotification,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.delete("/clear-all", authMiddleware, clearAllNotifications);
router.put("/read-all", authMiddleware, markAllNotificationsRead);
router.put("/:id/read", authMiddleware, markNotificationRead);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
