import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

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
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
    } else {
      console.log("⚠️  No MONGO_URI provided");
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  type: { type: String, enum: ["note", "task"], default: "note" },
  color: { type: String, default: "yellow" },
  tags: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPinned: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isShared: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true },
  shareSettings: {
    allowEdit: { type: Boolean, default: false },
    accessRequests: [
      {
        email: String,
        message: String,
        requestedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "approved", "denied"],
          default: "pending",
        },
      },
    ],
  },
  // Task-specific fields
  taskStatus: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  dueDate: { type: Date },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  subtasks: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
};

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.post(
  "/api/auth/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      // Create user
      const user = new User({ name, email, password });
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: { id: user._id, name: user.name, email: user.email },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: { id: user._id, name: user.name, email: user.email },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Notes Routes
app.get("/api/notes", authenticateToken, async (req, res) => {
  try {
    const { search, tags, color, archived } = req.query;
    let query = { userId: req.user.userId };

    if (archived !== undefined) {
      query.isArchived = archived === "true";
    }

    if (color) {
      query.color = color;
    }

    if (tags) {
      const tagArray = tags.split(",");
      query.tags = { $in: tagArray };
    }

    let notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    if (search) {
      const searchRegex = new RegExp(search, "i");
      notes = notes.filter(
        (note) =>
          searchRegex.test(note.title) ||
          searchRegex.test(note.content) ||
          note.tags.some((tag) => searchRegex.test(tag))
      );
    }

    res.json({
      success: true,
      data: { notes },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post(
  "/api/notes",
  authenticateToken,
  [body("title").notEmpty().withMessage("Title is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, content, color, tags } = req.body;

      const note = new Note({
        title,
        content: content || "",
        color: color || "yellow",
        tags: tags || [],
        userId: req.user.userId,
      });

      await note.save();

      res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: { note },
      });
    } catch (error) {
      console.error("Create note error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

app.put("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true }
    );

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note updated successfully",
      data: { note },
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Sharing Routes
app.post("/api/notes/:id/share", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { allowEdit } = req.body;

    // Generate unique share ID
    const shareId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      {
        isShared: true,
        shareId: shareId,
        "shareSettings.allowEdit": allowEdit || false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note shared successfully",
      data: {
        shareId: shareId,
        shareUrl: `${req.protocol}://${req.get("host")}/shared/${shareId}`,
      },
    });
  } catch (error) {
    console.error("Share note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/notes/:id/share", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      {
        isShared: false,
        $unset: { shareId: 1 },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note sharing disabled successfully",
    });
  } catch (error) {
    console.error("Unshare note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/shared/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    const note = await Note.findOne({ shareId, isShared: true })
      .populate("userId", "name email")
      .select("-__v");

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Shared note not found" });
    }

    res.json({
      success: true,
      data: { note },
    });
  } catch (error) {
    console.error("Get shared note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post(
  "/api/shared/:shareId/request-access",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { shareId } = req.params;
      const { email, message } = req.body;

      const note = await Note.findOneAndUpdate(
        { shareId, isShared: true },
        {
          $push: {
            "shareSettings.accessRequests": { email, message },
          },
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!note) {
        return res
          .status(404)
          .json({ success: false, message: "Shared note not found" });
      }

      res.json({
        success: true,
        message: "Access request sent successfully",
      });
    } catch (error) {
      console.error("Request access error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
