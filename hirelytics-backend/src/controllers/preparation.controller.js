import PreparationNote from "../models/PreparationNote.js";
import User from "../models/User.js";
import { broadcastNotificationToAllUsers } from "../services/notification.service.js";

const MAX_PDF_SIZE_BYTES = 8 * 1024 * 1024;

const estimateDataUrlBytes = (pdfDataUrl = "") => {
  const [, base64 = ""] = `${pdfDataUrl}`.split(",");
  if (!base64) {
    return 0;
  }

  return Math.floor((base64.length * 3) / 4);
};

const notifyPreparationUpdate = (payload) => {
  broadcastNotificationToAllUsers(payload).catch((error) => {
    console.error("Preparation notification failed:", error.message);
  });
};

const parseTags = (tags = []) => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => `${tag}`.trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeCategory = (category = "") =>
  `${category}`.trim() === "DBMS" ? "SQL" : `${category}`.trim();

const presentCategory = (category = "") =>
  `${category}`.trim() === "DBMS" ? "SQL" : `${category}`.trim();

const presentNote = (note, { includePdf = false } = {}) => {
  const plain = note.toObject ? note.toObject() : { ...note };

  if (!includePdf) {
    delete plain.pdfDataUrl;
  }

  return {
    ...plain,
    category: presentCategory(plain.category),
  };
};

export const getNotes = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      const normalizedCategory = normalizeCategory(category);
      filter.category =
        normalizedCategory === "SQL"
          ? { $in: ["SQL", "DBMS"] }
          : normalizedCategory;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { pdfName: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const notes = await PreparationNote.find(filter)
      .select("-pdfDataUrl")
      .sort({ updatedAt: -1 })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.json(notes.map((note) => presentNote(note)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await PreparationNote.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.json(presentNote(note, { includePdf: true }));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, category, summary, pdfName, pdfDataUrl, pdfSize, tags } =
      req.body;

    if (!pdfName || !pdfDataUrl) {
      return res.status(400).json({ message: "PDF upload is required" });
    }

    if (!pdfDataUrl.startsWith("data:application/pdf;base64,")) {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    const effectivePdfSize = Number(pdfSize) || estimateDataUrlBytes(pdfDataUrl);
    if (effectivePdfSize > MAX_PDF_SIZE_BYTES) {
      return res.status(413).json({
        message: "PDF size should be 8 MB or smaller for reliable upload.",
      });
    }

    const note = await PreparationNote.create({
      title,
      category: normalizeCategory(category),
      summary,
      pdfName,
      pdfDataUrl,
      pdfSize: effectivePdfSize,
      tags: parseTags(tags),
      createdBy: req.userId,
      updatedBy: req.userId,
    });

    const populatedNote = await PreparationNote.findById(note._id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    notifyPreparationUpdate({
      title: "New Study Note Added",
      message: `Admin added a new preparation note in ${presentCategory(note.category)}: ${note.title}`,
      type: "announcement",
      category: "preparation",
      link: "/preparation",
      createdBy: req.userId,
    });

    res.status(201).json(presentNote(populatedNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, category, summary, pdfName, pdfDataUrl, pdfSize, tags } =
      req.body;

    const note = await PreparationNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.title = title;
    note.category = normalizeCategory(category);
    note.summary = summary;
    if (pdfDataUrl) {
      if (!pdfDataUrl.startsWith("data:application/pdf;base64,")) {
        return res.status(400).json({ message: "Only PDF files are allowed" });
      }

      const effectivePdfSize = Number(pdfSize) || estimateDataUrlBytes(pdfDataUrl);
      if (effectivePdfSize > MAX_PDF_SIZE_BYTES) {
        return res.status(413).json({
          message: "PDF size should be 8 MB or smaller for reliable upload.",
        });
      }

      note.pdfName = pdfName;
      note.pdfDataUrl = pdfDataUrl;
      note.pdfSize = effectivePdfSize;
    }
    note.tags = parseTags(tags);
    note.updatedBy = req.userId;
    await note.save();

    const populatedNote = await PreparationNote.findById(note._id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    notifyPreparationUpdate({
      title: "Preparation Note Updated",
      message: `Admin updated ${note.title}. Check the latest study material.`,
      type: "announcement",
      category: "preparation",
      link: "/preparation",
      createdBy: req.userId,
    });

    res.json(presentNote(populatedNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await PreparationNote.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    notifyPreparationUpdate({
      title: "Study Material Changed",
      message: `Admin removed ${note.title} from the preparation library.`,
      type: "warning",
      category: "preparation",
      link: "/preparation",
      createdBy: req.userId,
    });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeNote = async (req, res) => {
  try {
    const note = await PreparationNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const alreadyCompleted = (note.completedBy || []).some(
      (entry) => `${entry.user}` === `${req.userId}`,
    );

    if (alreadyCompleted) {
      return res.status(200).json({
        message: "Note already marked as completed.",
        pointsEarned: 0,
        alreadyCompleted: true,
      });
    }

    note.completedBy.push({
      user: req.userId,
      completedAt: new Date(),
    });
    await note.save();

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalPoints = (user.totalPoints || user.points || 0) + 10;
    user.points = user.totalPoints;
    user.currentLevelPoints = (user.currentLevelPoints || 0) + 10;
    user.level = Math.floor((user.totalPoints || 0) / 100) + 1;
    await user.save();

    return res.status(200).json({
      message: "Note marked as completed. 10 points awarded.",
      pointsEarned: 10,
      alreadyCompleted: false,
      totalPoints: user.totalPoints,
      level: user.level,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
