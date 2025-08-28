import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Tag,
  User,
  LogOut,
  Moon,
  Sun,
  Share2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Download,
  Mic,
  MicOff,
  BarChart3,
} from "lucide-react";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://notes-app-server-mcpb.onrender.com/api";

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [shareNote, setShareNote] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Auth form states
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Note form states
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    type: "note",
    color: "yellow",
    tags: [],
    dueDate: "",
    priority: "medium",
    taskStatus: "pending",
    subtasks: [],
  });

  const colors = [
    { name: "yellow", value: "#fef3c7" },
    { name: "blue", value: "#dbeafe" },
    { name: "green", value: "#d1fae5" },
    { name: "pink", value: "#fce7f3" },
    { name: "purple", value: "#e9d5ff" },
    { name: "orange", value: "#fed7aa" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
      fetchNotes();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem("token");
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data.data.notes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = authMode === "login" ? "login" : "register";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const response = await axios.post(
        `${API_BASE_URL}/auth/${endpoint}`,
        payload
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        setUser(response.data.data.user);
        setAuthForm({ name: "", email: "", password: "" });
        fetchNotes();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNotes([]);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (currentNote) {
        // Update existing note
        await axios.put(
          `${API_BASE_URL}/notes/${currentNote._id}`,
          noteForm,
          config
        );
      } else {
        // Create new note
        await axios.post(`${API_BASE_URL}/notes`, noteForm, config);
      }

      setShowNoteEditor(false);
      setCurrentNote(null);
      setNoteForm({ title: "", content: "", color: "yellow", tags: [] });
      fetchNotes();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (error) {
      alert("Failed to delete note");
    }
  };

  const handleShareNote = async (note) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/notes/${note._id}/share`,
        { allowEdit: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShareNote(note);
        setShareUrl(response.data.data.shareUrl);
        setShowShareModal(true);
        fetchNotes(); // Refresh to show share status
      }
    } catch (error) {
      alert("Failed to share note");
    }
  };

  const handleUnshareNote = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notes/${noteId}/share`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes(); // Refresh to show updated share status
    } catch (error) {
      alert("Failed to unshare note");
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  // PDF Download Function
  const downloadNotePDF = async (note) => {
    const pdf = new jsPDF();

    // Add title
    pdf.setFontSize(20);
    pdf.text(note.title, 20, 30);

    // Add metadata
    pdf.setFontSize(12);
    pdf.text(
      `Created: ${new Date(note.createdAt).toLocaleDateString()}`,
      20,
      50
    );
    pdf.text(`Type: ${note.type}`, 20, 60);

    if (note.tags && note.tags.length > 0) {
      pdf.text(`Tags: ${note.tags.join(", ")}`, 20, 70);
    }

    // Add content (strip HTML)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    const splitText = pdf.splitTextToSize(textContent, 170);
    pdf.text(splitText, 20, 90);

    // Add task-specific info
    if (note.type === "task") {
      let yPos = 90 + splitText.length * 5 + 20;

      if (note.dueDate) {
        pdf.text(
          `Due Date: ${new Date(note.dueDate).toLocaleDateString()}`,
          20,
          yPos
        );
        yPos += 10;
      }

      pdf.text(`Priority: ${note.priority}`, 20, yPos);
      yPos += 10;
      pdf.text(`Status: ${note.taskStatus}`, 20, yPos);

      if (note.subtasks && note.subtasks.length > 0) {
        yPos += 20;
        pdf.text("Subtasks:", 20, yPos);
        note.subtasks.forEach((subtask, index) => {
          yPos += 10;
          const status = subtask.completed ? "✓" : "○";
          pdf.text(`${status} ${subtask.title}`, 30, yPos);
        });
      }
    }

    pdf.save(`${note.title}.pdf`);
  };

  // Voice Recognition Functions
  const initializeVoiceRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setNoteForm((prev) => ({
          ...prev,
          content: prev.content + " " + transcript,
        }));
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognition) {
      initializeVoiceRecognition();
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  // Initialize voice recognition on component mount
  useEffect(() => {
    initializeVoiceRecognition();
  }, []);

  const openNoteEditor = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setNoteForm({
        title: note.title,
        content: note.content,
        type: note.type || "note",
        color: note.color,
        tags: note.tags,
        dueDate: note.dueDate
          ? new Date(note.dueDate).toISOString().split("T")[0]
          : "",
        priority: note.priority || "medium",
        taskStatus: note.taskStatus || "pending",
        subtasks: note.subtasks || [],
      });
    } else {
      setCurrentNote(null);
      setNoteForm({
        title: "",
        content: "",
        type: "note",
        color: "yellow",
        tags: [],
        dueDate: "",
        priority: "medium",
        taskStatus: "pending",
        subtasks: [],
      });
    }
    setShowNoteEditor(true);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (!user) {
    return (
      <div className={`app ${darkMode ? "dark" : ""}`}>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>📝 Notes App</h1>
              <p>Your personal note-taking companion</p>
            </div>

            <div className="auth-tabs">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              {authMode === "register" && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login"
                  : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>📝 Notes App</h1>
        </div>

        <div className="header-center">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="icon-button"
            title="Analytics Dashboard"
          >
            <BarChart3 size={20} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="icon-button"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-menu">
            <User size={20} />
            <span>{user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="notes-header">
          <h2>My Notes & Tasks ({filteredNotes.length})</h2>
          <div className="header-buttons">
            <button
              onClick={() => {
                setNoteForm({ ...noteForm, type: "note" });
                openNoteEditor();
              }}
              className="add-note-button"
            >
              <Plus size={20} />
              Add Note
            </button>
            <button
              onClick={() => {
                setNoteForm({ ...noteForm, type: "task" });
                openNoteEditor();
              }}
              className="add-task-button"
            >
              <CheckSquare size={20} />
              Add Task
            </button>
          </div>
        </div>

        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="note-card"
              style={{
                backgroundColor: colors.find((c) => c.name === note.color)
                  ?.value,
              }}
            >
              <div className="note-header">
                <div className="note-title-section">
                  <h3>{note.title}</h3>
                  {note.type === "task" && (
                    <span className={`task-status ${note.taskStatus}`}>
                      {note.taskStatus === "completed" ? (
                        <CheckCircle2 size={16} />
                      ) : note.taskStatus === "in-progress" ? (
                        <Clock size={16} />
                      ) : note.taskStatus === "cancelled" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                      {note.taskStatus}
                    </span>
                  )}
                </div>
                <div className="note-actions">
                  <button onClick={() => openNoteEditor(note)}>
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => downloadNotePDF(note)}
                    className="download-button"
                    title="Download as PDF"
                  >
                    <Download size={16} />
                  </button>
                  {note.isShared ? (
                    <button
                      onClick={() => handleUnshareNote(note._id)}
                      className="share-button shared"
                      title="Unshare note"
                    >
                      <Share2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleShareNote(note)}
                      className="share-button"
                      title="Share note"
                    >
                      <Share2 size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDeleteNote(note._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="note-content">
                {note.type === "note" ? (
                  <div dangerouslySetInnerHTML={{ __html: note.content }} />
                ) : (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    {note.dueDate && (
                      <div className="task-due-date">
                        <Calendar size={14} />
                        Due: {new Date(note.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {note.subtasks && note.subtasks.length > 0 && (
                      <div className="subtasks">
                        <h4>Subtasks:</h4>
                        {note.subtasks.map((subtask, index) => (
                          <div
                            key={index}
                            className={`subtask ${
                              subtask.completed ? "completed" : ""
                            }`}
                          >
                            {subtask.completed ? (
                              <CheckSquare size={14} />
                            ) : (
                              <Square size={14} />
                            )}
                            {subtask.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="note-footer">
                <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="empty-state">
            <h3>No notes found</h3>
            <p>Create your first note to get started!</p>
            <button
              onClick={() => openNoteEditor()}
              className="add-note-button"
            >
              <Plus size={20} />
              Create Note
            </button>
          </div>
        )}
      </main>

      {/* Note Editor Modal */}
      {showNoteEditor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {currentNote
                  ? `Edit ${noteForm.type}`
                  : `Create ${noteForm.type}`}
              </h3>
              <button onClick={() => setShowNoteEditor(false)}>×</button>
            </div>

            <form onSubmit={handleSaveNote} className="note-form">
              <div className="form-group">
                <label>Type</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-option ${
                      noteForm.type === "note" ? "selected" : ""
                    }`}
                    onClick={() => setNoteForm({ ...noteForm, type: "note" })}
                  >
                    <Edit3 size={16} />
                    Note
                  </button>
                  <button
                    type="button"
                    className={`type-option ${
                      noteForm.type === "task" ? "selected" : ""
                    }`}
                    onClick={() => setNoteForm({ ...noteForm, type: "task" })}
                  >
                    <CheckSquare size={16} />
                    Task
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <div className="content-header">
                  <label>Content</label>
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`voice-button ${isRecording ? "recording" : ""}`}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    {isRecording ? "Recording..." : "Voice Input"}
                  </button>
                </div>
                <textarea
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  placeholder="Write your content here..."
                  rows={10}
                  className="content-textarea"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-option ${
                        noteForm.color === color.name ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setNoteForm({ ...noteForm, color: color.name })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={noteForm.tags.join(", ")}
                  onChange={(e) =>
                    setNoteForm({
                      ...noteForm,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                />
              </div>

              {/* Task-specific fields */}
              {noteForm.type === "task" && (
                <>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={noteForm.dueDate}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={noteForm.priority}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, priority: e.target.value })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={noteForm.taskStatus}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, taskStatus: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subtasks</label>
                    <div className="subtasks-editor">
                      {noteForm.subtasks.map((subtask, index) => (
                        <div key={index} className="subtask-item">
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => {
                              const newSubtasks = [...noteForm.subtasks];
                              newSubtasks[index].title = e.target.value;
                              setNoteForm({
                                ...noteForm,
                                subtasks: newSubtasks,
                              });
                            }}
                            placeholder="Subtask title"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSubtasks = noteForm.subtasks.filter(
                                (_, i) => i !== index
                              );
                              setNoteForm({
                                ...noteForm,
                                subtasks: newSubtasks,
                              });
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNoteForm({
                            ...noteForm,
                            subtasks: [
                              ...noteForm.subtasks,
                              { title: "", completed: false },
                            ],
                          });
                        }}
                        className="add-subtask-btn"
                      >
                        + Add Subtask
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowNoteEditor(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Share Note</h3>
              <button onClick={() => setShowShareModal(false)}>×</button>
            </div>

            <div className="share-content">
              <p>
                Your note "<strong>{shareNote?.title}</strong>" is now shared!
              </p>

              <div className="share-url-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-url-input"
                />
                <button onClick={copyShareUrl} className="copy-button">
                  <Copy size={16} />
                  Copy
                </button>
              </div>

              <div className="share-info">
                <p>
                  📖 This note is shared as <strong>read-only</strong>
                </p>
                <p>🔗 Anyone with this link can view the note</p>
                <p>✉️ Viewers can request edit access from you</p>
              </div>

              <div className="share-actions">
                <button
                  onClick={() => window.open(shareUrl, "_blank")}
                  className="preview-button"
                >
                  <ExternalLink size={16} />
                  Preview
                </button>
                <button
                  onClick={() => {
                    handleUnshareNote(shareNote._id);
                    setShowShareModal(false);
                  }}
                  className="unshare-button"
                >
                  Stop Sharing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div
            className="modal analytics-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>📊 Analytics Dashboard</h3>
              <button onClick={() => setShowAnalytics(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>📝 Total Notes</h4>
                  <div className="analytics-number">
                    {notes.filter((note) => note.type === "note").length}
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>✅ Total Tasks</h4>
                  <div className="analytics-number">
                    {notes.filter((note) => note.type === "task").length}
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>🎯 Completed Tasks</h4>
                  <div className="analytics-number">
                    {
                      notes.filter(
                        (note) =>
                          note.type === "task" &&
                          note.taskStatus === "completed"
                      ).length
                    }
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>⏰ Pending Tasks</h4>
                  <div className="analytics-number">
                    {
                      notes.filter(
                        (note) =>
                          note.type === "task" && note.taskStatus === "pending"
                      ).length
                    }
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>🔗 Shared Items</h4>
                  <div className="analytics-number">
                    {notes.filter((note) => note.isShared).length}
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>🏷️ Total Tags</h4>
                  <div className="analytics-number">
                    {
                      [...new Set(notes.flatMap((note) => note.tags || []))]
                        .length
                    }
                  </div>
                </div>
              </div>

              <div className="analytics-section">
                <h4>📈 Most Used Tags</h4>
                <div className="tag-frequency">
                  {(() => {
                    const tagCounts = {};
                    notes.forEach((note) => {
                      (note.tags || []).forEach((tag) => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                      });
                    });
                    return Object.entries(tagCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([tag, count]) => (
                        <div key={tag} className="tag-stat">
                          <span className="tag-name">{tag}</span>
                          <span className="tag-count">{count}</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              <div className="analytics-section">
                <h4>🎨 Color Distribution</h4>
                <div className="color-stats">
                  {(() => {
                    const colorCounts = {};
                    notes.forEach((note) => {
                      const color = note.color || "yellow";
                      colorCounts[color] = (colorCounts[color] || 0) + 1;
                    });
                    return Object.entries(colorCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([color, count]) => (
                        <div key={color} className="color-stat">
                          <div
                            className="color-indicator"
                            style={{
                              backgroundColor:
                                colors.find((c) => c.name === color)?.value ||
                                "#fef3c7",
                            }}
                          ></div>
                          <span>
                            {color}: {count}
                          </span>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
