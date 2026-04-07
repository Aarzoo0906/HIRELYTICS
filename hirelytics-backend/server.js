import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { ensureAdminUsers } from "./src/services/adminUser.service.js";
import { logDiagnostics } from "./src/utils/diagnostics.js";

const PORT = process.env.PORT || 5000;

// Log diagnostics at startup
console.log("\n");
logDiagnostics();
console.log("\n");

// Debug environment variables
console.log("✓ Environment Check:");
console.log("  GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);
console.log("  JWT SECRET LOADED:", !!process.env.JWT_SECRET);
console.log("  Database URL:", process.env.MONGODB_URI ? "✓ Set" : "✗ Not set");
console.log("  Frontend URL:", process.env.FRONTEND_URL || "http://localhost:5173");

// Connect DB and start server
connectDB()
  .then(async () => {
    await ensureAdminUsers();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Frontend: http://localhost:5173`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🎯 Interview Endpoint: http://localhost:${PORT}/api/interview/generate-questions`);
      console.log("\n✅ Backend is ready!\n");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });
