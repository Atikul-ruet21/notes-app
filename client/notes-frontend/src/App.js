import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  Pin,
  Tag,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

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
    color: "yellow",
    tags: [],
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
        setShowAuthModal(false);
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

  const openNoteEditor = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setNoteForm({
        title: note.title,
        content: note.content,
        color: note.color,
        tags: note.tags,
      });
    } else {
      setCurrentNote(null);
      setNoteForm({ title: "", content: "", color: "yellow", tags: [] });
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
            {/* Auntor */}
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
            {/* Atikul */}
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
          <h2>My Notes ({filteredNotes.length})</h2>
          <button onClick={() => openNoteEditor()} className="add-note-button">
            <Plus size={20} />
            Add Note
          </button>
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
                <h3>{note.title}</h3>
                <div className="note-actions">
                  <button onClick={() => openNoteEditor(note)}>
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDeleteNote(note._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="note-content">
                <p>{note.content}</p>
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
              <h3>{currentNote ? "Edit Note" : "Create Note"}</h3>
              <button onClick={() => setShowNoteEditor(false)}>×</button>
            </div>

            <form onSubmit={handleSaveNote} className="note-form">
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
                <label>Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  rows="6"
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
    </div>
  );
}

export default App;
