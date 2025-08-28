# 📝 Notes App - Complete MERN Stack Application

A beautiful, modern notes application built with React.js, Express.js, and MongoDB. Features include user authentication, CRUD operations, search functionality, color coding, tagging, and responsive design.

## ✨ Features

- 🔐 **User Authentication** - Secure login/register system
- 📝 **CRUD Operations** - Create, read, update, delete notes
- 🔍 **Real-time Search** - Search through titles, content, and tags
- 🏷️ **Tagging System** - Organize notes with custom tags
- 🎨 **Color Coding** - Visual organization with 6 color options
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast & Smooth** - Optimized performance and animations
- 🔒 **Secure** - JWT authentication and input validation

## 🚀 Quick Start Guide for Windows VS Code

### Prerequisites
Make sure you have installed:
- **Node.js** (v16 or higher) - Download from https://nodejs.org/
- **VS Code** - Download from https://code.visualstudio.com/
- **Git** (optional) - Download from https://git-scm.com/

### Step 1: Extract and Open Project
1. Extract the `notes-app.zip` file to your desired location
2. Open VS Code
3. Go to `File > Open Folder` and select the extracted `notes-app` folder

### Step 2: Setup Backend Server
1. Open VS Code terminal (`Ctrl + ` ` or `View > Terminal`)
2. Navigate to server folder:
   ```bash
   cd server
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. You should see: `🚀 Server running on port 5000`

### Step 3: Setup Frontend (New Terminal)
1. Open a new terminal tab (`Ctrl + Shift + ` ` or click the + icon)
2. Navigate to client folder:
   ```bash
   cd client/notes-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the React app:
   ```bash
   npm start
   ```
5. Your browser will automatically open to `http://localhost:3000`

### Step 4: Start Using the App
1. **Register** a new account or **Login** with existing credentials
2. **Create** your first note by clicking the "Add Note" button
3. **Search** through your notes using the search bar
4. **Organize** notes with colors and tags
5. **Toggle** dark mode using the moon/sun icon

## 🛠️ Project Structure

```
notes-app/
├── server/                 # Backend (Express.js + MongoDB)
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── client/                # Frontend (React.js)
│   └── notes-frontend/
│       ├── src/
│       │   ├── App.js     # Main React component
│       │   ├── App.css    # Styling
│       │   └── index.js   # React entry point
│       └── package.json   # Frontend dependencies
└── README.md             # This file
```

## 🔧 Configuration

### MongoDB Setup (Already Configured)
The app is pre-configured with a MongoDB Atlas database. No additional setup required!

### Environment Variables
The `.env` file in the server folder contains:
```
MONGO_URI=mongodb+srv://... (Already configured)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

## 📱 Usage Instructions

### Creating Notes
1. Click the "Add Note" button
2. Enter a title and content
3. Choose a color for visual organization
4. Add tags separated by commas (e.g., "work, important, project")
5. Click "Save Note"

### Managing Notes
- **Edit**: Click the edit icon on any note
- **Delete**: Click the trash icon (with confirmation)
- **Search**: Use the search bar to find notes by title, content, or tags
- **Filter**: Notes are automatically organized by creation date

### Customization
- **Dark Mode**: Click the moon/sun icon in the header
- **Colors**: Choose from 6 beautiful color options for each note
- **Tags**: Create unlimited tags for organization

## 🚨 Troubleshooting

### Common Issues and Solutions

**Issue**: "npm is not recognized"
- **Solution**: Install Node.js from https://nodejs.org/ and restart VS Code

**Issue**: Port 3000 or 5000 already in use
- **Solution**: Close other applications using these ports or change ports in the code

**Issue**: Cannot connect to database
- **Solution**: Check your internet connection (MongoDB Atlas requires internet)

**Issue**: Login/Register not working
- **Solution**: Make sure the backend server is running on port 5000

### Getting Help
1. Check that both servers are running (backend on :5000, frontend on :3000)
2. Look at the terminal for error messages
3. Make sure all dependencies are installed (`npm install` in both folders)

## 🎯 Development Commands

### Backend Commands
```bash
cd server
npm start          # Start production server
npm run dev        # Start development server with nodemon (if available)
```

### Frontend Commands
```bash
cd client/notes-frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🌟 Features in Detail

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Automatic token management
- Session persistence

### Note Management
- Rich text support
- Auto-save functionality (manual save for now)
- Instant search and filtering
- Drag-and-drop organization (visual)

### User Interface
- Modern, clean design
- Smooth animations and transitions
- Mobile-responsive layout
- Accessibility features

### Performance
- Optimized React components
- Efficient database queries
- Compressed assets
- Fast loading times

## 📄 License

This project is licensed under the MIT License - feel free to use it for personal or commercial projects.

## 🤝 Support

If you encounter any issues or need help:
1. Check the troubleshooting section above
2. Make sure you followed all setup steps
3. Verify that Node.js and npm are properly installed
4. Ensure both servers are running simultaneously

---

**Enjoy your new Notes App! 🎉**

Made with ❤️ using React.js, Express.js, and MongoDB

