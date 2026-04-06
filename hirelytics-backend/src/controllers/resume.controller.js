import {
  analyzeResumePayload,
  improveResumePayload,
  buildResumeFromScratch,
} from "../services/resumeWorkbench.service.js";

export const analyzeResume = async (req, res) => {
  try {
    const analysis = await analyzeResumePayload(req.body || {});
    res.json(analysis);
  } catch (error) {
    res.status(400).json({ message: error.message || "Resume analysis failed." });
  }
};

export const improveResume = async (req, res) => {
  try {
    const result = await improveResumePayload(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || "Resume improvement failed." });
  }
};

export const buildResume = async (req, res) => {
  try {
    const result = await buildResumeFromScratch(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || "Resume generation failed." });
  }
};
