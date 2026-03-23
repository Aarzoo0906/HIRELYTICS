import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.json({
      name: user.name,
      points: user.points,
      level: user.level,
      interviewsTaken: user.interviewsTaken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};