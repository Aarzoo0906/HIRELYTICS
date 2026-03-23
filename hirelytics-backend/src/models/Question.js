import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    questionText: {
      type: String,
      required: true,
    },

    sampleAnswer: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);