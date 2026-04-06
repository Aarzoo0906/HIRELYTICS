import express from "express";
import { sendSupportRequest } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/support", sendSupportRequest);

export default router;
