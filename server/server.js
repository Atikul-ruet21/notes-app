import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌// f:\notes-app\server\server.js
      
      import authRoutes from "./routes/authRoutes.js";
      import noteRoutes from "./routes/noteRoutes.js";
      import shareRoutes from "./routes/shareRoutes.js";
      
      // ...
      
      app.use("/api/auth", authRoutes);
      app.use("/api/notes", noteRoutes);
      app.use("/api/shared", shareRoutes);
      FATAL ERROR: MONGO_URI is not defined in .env file.");
  } catch (error) {
    }// ... (all route definitions like router.get(...), router.post(...), etc.)
    
    export default router;
    process.exit(1);
  }
    process.exit(1); // Exit process with failure

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

});
app.use("/api/notes", noteRoutes);
app.use("/api/shared", shareRoutes);
// Error handling
app.use((err, req, res, next) => {

  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

  res.status(404).json({ success: false, message: "Route not found" });
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
