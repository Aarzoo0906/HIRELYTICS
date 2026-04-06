import User from "../models/User.js";
import Notification from "../models/Notification.js";

const buildNotificationDocs = (users = [], payload = {}) =>
  users.map((user) => ({
    userId: user._id,
    title: payload.title,
    message: payload.message,
    type: payload.type || "info",
    category: payload.category || "general",
    link: payload.link || "",
    createdBy: payload.createdBy || null,
  }));

export const createNotificationForUser = async (userId, payload) => {
  if (!userId || !payload?.title || !payload?.message) {
    return null;
  }

  return Notification.create({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || "info",
    category: payload.category || "general",
    link: payload.link || "",
    createdBy: payload.createdBy || null,
  });
};

export const broadcastNotificationToAllUsers = async (payload) => {
  if (!payload?.title || !payload?.message) {
    return 0;
  }

  const filter = payload.createdBy
    ? { _id: { $ne: payload.createdBy } }
    : {};

  const users = await User.find(filter).select("_id").lean();
  if (!users.length) {
    return 0;
  }

  const docs = buildNotificationDocs(users, payload);
  const result = await Notification.insertMany(docs);
  return result.length;
};
