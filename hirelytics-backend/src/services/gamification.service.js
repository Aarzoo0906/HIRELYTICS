import Badge from "../models/Badge.js";

export const updateUserGamification = async (user) => {
  user.level = Math.floor(user.points / 100) + 1;

  const badges = await Badge.find({
    pointsRequired: { $lte: user.points },
  });

  user.badges = badges.map((b) => b._id);
  await user.save();

  return user;
};