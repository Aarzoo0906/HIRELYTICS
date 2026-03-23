import User from "../models/User.js";
import Interview from "../models/Interview.js";

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