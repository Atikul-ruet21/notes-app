export default router;
import express from "express";
import { body } from "express-validator";
import authenticateToken from "../middleware/authMiddleware.js";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.get("/", authenticateToken, getNotes);
router.post(
  "/",
  authenticateToken,
  [body("title").notEmpty().withMessage("Title is required")],
  createNote
);
router.put("/:id", authenticateToken, updateNote);
router.delete("/:id", authenticateToken, deleteNote);

export default router;
