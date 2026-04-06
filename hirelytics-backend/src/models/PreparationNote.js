import mongoose from "mongoose";

const preparationNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "DSA",
        "HR",
        "Project Ideas",
        "MERN",
        "Java",
        "JavaScript",
        "Python",
        "C",
        "C++",
        "SQL",
        "DBMS",
        "OOPS",
        "Important Programs",
      ],
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    pdfName: {
      type: String,
      required: true,
      trim: true,
    },
    pdfDataUrl: {
      type: String,
      required: true,
    },
    pdfSize: {
      type: Number,
      required: true,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedBy: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          completedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("PreparationNote", preparationNoteSchema);
