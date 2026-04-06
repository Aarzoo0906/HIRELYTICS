import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load notifications." });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update notification." });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to mark notifications read." });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json({ success: true, notificationId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete notification." });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to clear notifications." });
  }
};
