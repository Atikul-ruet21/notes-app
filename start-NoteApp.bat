@echo off
echo ========================================
echo    Notes App - Quick Start Script
echo ========================================
echo.
echo Starting Notes App servers...
echo.
echo 1. Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm start"
echo Backend server started on port 5000
echo.
echo 2. Starting Frontend Server...
cd ../client/notes-frontend
start "Frontend Server" cmd /k "npm start"
echo Frontend server started on port 3000
echo.
echo ========================================
echo Both servers are starting up!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Your browser should open automatically.
echo If not, open http://localhost:3000
echo ========================================
echo.
pause

