import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  completeNote,
} from "../controllers/preparation.controller.js";

const router = express.Router();

router.get("/notes", authMiddleware, getNotes);
router.post("/notes", authMiddleware, adminMiddleware, createNote);
router.put("/notes/:id", authMiddleware, adminMiddleware, updateNote);
router.delete("/notes/:id", authMiddleware, adminMiddleware, deleteNote);
router.post("/notes/:id/complete", authMiddleware, completeNote);

export default router;
