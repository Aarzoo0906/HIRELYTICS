import User from "../models/User.js";
import Interview from "../models/Interview.js";
import { broadcastNotificationToAllUsers } from "../services/notification.service.js";

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();

    res.json({
      totalUsers,
      totalInterviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersUsage = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const trimmedSearch = search.trim();
    const filter = trimmedSearch
      ? {
          $or: [
            { name: { $regex: trimmedSearch, $options: "i" } },
            { email: { $regex: trimmedSearch, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("name email role points level interviewsTaken totalTimeSpentSeconds")
      .sort({ totalTimeSpentSeconds: -1, name: 1 })
      .lean();

    res.json({
      users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, link = "/dashboard", type = "announcement" } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const count = await broadcastNotificationToAllUsers({
      title: title.trim(),
      message: message.trim(),
      type,
      category: "project-update",
      link,
      createdBy: req.userId,
    });

    res.json({
      success: true,
      delivered: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to send announcement." });
  }
};
