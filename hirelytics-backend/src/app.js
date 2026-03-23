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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gamification", gamificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Hirelytics API is running 🚀");
});

// Error handler (last)
app.use(errorHandler);

export default app;
