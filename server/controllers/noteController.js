import Note from "../models/Note.js";
import { validationResult } from "express-validator";

export const getNotes = async (req, res) => {
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
};

export const createNote = async (req, res) => {
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
};

export const updateNote = async (req, res) => {
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
};

export const deleteNote = async (req, res) => {
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
};
