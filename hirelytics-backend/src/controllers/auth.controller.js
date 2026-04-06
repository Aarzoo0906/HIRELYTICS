import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";
import { isAllowedAdminEmail } from "../config/adminUsers.js";

const buildAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mustChangePassword: user.mustChangePassword,
  points: user.points,
  level: user.level,
  interviewsTaken: user.interviewsTaken,
  totalTimeSpentSeconds: user.totalTimeSpentSeconds || 0,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: isAllowedAdminEmail(normalizedEmail) ? "admin" : "user",
      mustChangePassword: false,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: buildAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (isAllowedAdminEmail(normalizedEmail) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: buildAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    res.json({
      user: buildAuthUser(req.user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 4) {
      return res
        .status(400)
        .json({ message: "New password must be at least 4 characters long" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({
      message: "Password changed successfully",
      user: buildAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSessionTime = async (req, res) => {
  try {
    const { totalTimeSpentSeconds } = req.body;

    if (!Number.isFinite(totalTimeSpentSeconds) || totalTimeSpentSeconds < 0) {
      return res.status(400).json({
        message: "A valid totalTimeSpentSeconds value is required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalTimeSpentSeconds = Math.max(
      user.totalTimeSpentSeconds || 0,
      Math.floor(totalTimeSpentSeconds),
    );
    await user.save();

    res.json({
      message: "Session time updated",
      totalTimeSpentSeconds: user.totalTimeSpentSeconds,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
