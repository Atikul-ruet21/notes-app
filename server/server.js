import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ FATAL ERROR: MONGO_URI is not defined in .env file.");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/shared", shareRoutes);

// --- Error Handling ---

// 404 Not Found Handler (for routes not matched)
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Generic Error Handler (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// --- Start Server ---
const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
