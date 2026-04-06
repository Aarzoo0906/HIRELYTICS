import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["technical", "hr"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    questions: [
      {
        questionIndex: Number,
        answer: String,
        score: Number,
        feedback: String,
      },
    ],

    totalScore: {
      type: Number,
      default: 0,
      index: true,
    },

    totalTime: {
      type: Number,
      default: 0,
    },

    timePerQuestion: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["completed", "incomplete", "timeout"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);