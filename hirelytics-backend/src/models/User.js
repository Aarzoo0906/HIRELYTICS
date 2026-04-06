import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    points: {
      type: Number,
      default: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    interviewsTaken: {
      type: Number,
      default: 0,
    },

    totalTimeSpentSeconds: {
      type: Number,
      default: 0,
    },

    currentLevelPoints: {
      type: Number,
      default: 0,
    },

    stats: {
      totalInterviews: { type: Number, default: 0 },
      perfectAnswers: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },

    loginStreak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastLoginDate: { type: Date, default: null },
    },

    interviewStreak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastInterviewDate: { type: Date, default: null },
    },

    achievements: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
