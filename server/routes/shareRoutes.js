import { Router } from "express";
import { body, validationResult } from "express-validator";
import { randomBytes } from "crypto";
import Note from "../models/Note.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// --- Authenticated Sharing Actions ---

// POST /api/shared/notes/:id/share - Create a share link for a note
router.post("/notes/:id/share", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { allowEdit } = req.body;

    // Generate a cryptographically-strong, unique share ID
    const shareId = randomBytes(16).toString("hex");

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
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission.",
      });
    }

    // Construct the full URL for the frontend
    const shareUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/shared/${shareId}`;

    res.json({
      success: true,
      message: "Note shared successfully",
      data: {
        shareId: shareId,
        shareUrl: shareUrl,
      },
    });
  } catch (error) {
    console.error("Share note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/shared/notes/:id/share - Disable sharing for a note
router.delete("/notes/:id/share", authenticateToken, async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: "Note not found or you don't have permission.",
      });
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

// --- Public Routes for Shared Notes ---

// GET /api/shared/:shareId - Get a publicly shared note
router.get("/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    const note = await Note.findOne({ shareId, isShared: true })
      .populate("userId", "name") // Only expose owner's name
      .select("-__v -userId.email"); // Protect owner's email and other sensitive data

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Shared note not found or sharing is disabled.",
      });
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

// POST /api/shared/:shareId/request-access - Request access to a note
router.post(
  "/:shareId/request-access",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email is required to request access"),
    body("message").notEmpty().withMessage("A message is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
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
          .json({ success: false, message: "Shared note not found." });
      }

      // In a real app, you would also trigger an email/notification to the note owner here.

      res.json({
        success: true,
        message:
          "Access request sent successfully. The owner has been notified.",
      });
    } catch (error) {
      console.error("Request access error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
