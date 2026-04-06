import express from "express";
import cors from "cors";
import rateLimiter from "./middlewares/rateLimit.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import preparationRoutes from "./routes/preparation.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import voiceRoutes from "./routes/voiceRoutes.js";
import notificationRoutes from "./routes/notification.routes.js";
import contactRoutes from "./routes/contact.routes.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "25mb" }));
app.use(rateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/preparation", preparationRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Hirelytics API is running 🚀");
});

// Error handler (last)
app.use(errorHandler);

export default app;
