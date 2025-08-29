import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  color: { type: String, default: "yellow" },
  tags: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPinned: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Fields for Task Management
  type: { type: String, default: 'note' }, // 'note' or 'task'
  dueDate: { type: Date },
  priority: { type: String, default: 'medium' }, // 'low', 'medium', 'high'
  taskStatus: { type: String, default: 'pending' }, // 'pending', 'in-progress', 'completed', 'cancelled'
  subtasks: [subtaskSchema],
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
