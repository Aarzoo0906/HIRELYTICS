import mongoose from "mongoose";

const voiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      enum: ["paragraph", "question"],
      required: true,
    },
    questionOrParagraph: {
      type: String,
      required: true,
      trim: true,
    },
    transcript: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    grammarFeedback: {
      type: String,
      default: "Needs Improvement",
    },
    pronunciationFeedback: {
      type: String,
      default: "Needs Improvement",
    },
    confidenceFeedback: {
      type: String,
      default: "Medium",
    },
    detectedIssues: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    fillerWordCount: {
      type: Number,
      default: 0,
    },
    wordsPerMinute: {
      type: Number,
      default: 0,
    },
    speechConfidence: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("VoiceSession", voiceSessionSchema);
