import { Router } from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All routes in this file are protected
router.use(authenticateToken);

// GET /api/notes - Get all notes for the logged-in user
router.get("/", getNotes);

// POST /api/notes - Create a new note
router.post("/", createNote);

// PUT /api/notes/:id - Update an existing note
router.put("/:id", updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", deleteNote);

export default router;