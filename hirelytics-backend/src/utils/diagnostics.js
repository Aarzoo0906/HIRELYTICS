import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Diagnostic utility to check backend health and configuration
 */
export const checkBackendHealth = () => {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || "5000",
    frontend_url: process.env.FRONTEND_URL || "http://localhost:5173",
  };

  // Check environment variables
  checks.env_vars = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  };

  // Check if database is configured
  checks.database_configured = !!process.env.MONGODB_URI;

  return checks;
};

/**
 * Log diagnostic information
 */
export const logDiagnostics = () => {
  const health = checkBackendHealth();
  console.log("=== BACKEND DIAGNOSTICS ===");
  console.log(JSON.stringify(health, null, 2));
  console.log("===========================");
};

export default { checkBackendHealth, logDiagnostics };
