# Notes App - Deployment Instructions

## Overview

This is a full-stack notes application with React frontend and Node.js/Express backend.

## Fixed Issues

1. **Frontend API URL Configuration**: Now uses environment variables instead of hardcoded localhost
2. **Server Configuration**: Backend now listens on 0.0.0.0 for deployment compatibility
3. **Environment Files**: Added .env and .env.production for proper configuration management

## Local Development Setup

### Backend Setup

1. Navigate to server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:

   - MONGO_URI: Your MongoDB connection string
   - JWT_SECRET: Your JWT secret key
   - PORT: Server port (default: 5000)

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd client/notes-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

## Environment Configuration

### Development (.env)

```
REACT_APP_API_BASE_URL=https://notes-app-server-mcpb.onrender.com/api
REACT_APP_API_TIMEOUT=10000
```

### Production (.env.production)

```
REACT_APP_API_BASE_URL=/api
REACT_APP_API_TIMEOUT=10000
```

## Production Deployment

### Backend Deployment

- The server is configured to listen on 0.0.0.0 for external access
- Ensure MongoDB connection is properly configured
- Set appropriate JWT_SECRET in production

### Frontend Deployment

- Build the React app: `npm run build`
- The production build will use the production environment variables
- Serve the built files through a web server or CDN

## Features

- User authentication (register/login)
- Create, edit, delete notes
- Task management with subtasks
- Note sharing functionality
- Rich text editing
- Voice recording support
- PDF export
- Dark mode
- Analytics dashboard

## Technology Stack

- Frontend: React 19, Axios, Lucide Icons
- Backend: Node.js, Express, MongoDB, JWT
- Authentication: JWT tokens
- Database: MongoDB with Mongoose
