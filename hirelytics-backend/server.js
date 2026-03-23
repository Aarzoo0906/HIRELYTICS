import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Debug environment variables
console.log("HF KEY LOADED:", !!process.env.HF_API_KEY);
console.log("OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});