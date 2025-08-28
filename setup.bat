@echo off
echo ========================================
echo    Notes App - Setup Script
echo ========================================
echo.
echo This script will install all dependencies for the Notes App.
echo Make sure you have Node.js installed before running this script.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul
echo.
echo Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!
echo.
echo Installing Frontend Dependencies...
cd ../client/notes-frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully!
echo.
echo ========================================
echo    Setup Complete! 🎉
echo ========================================
echo.
echo You can now start the app by running:
echo 1. Double-click 'start-app.bat' OR
echo 2. Run the following commands in separate terminals:
echo    - Backend:  cd server && npm start
echo    - Frontend: cd client/notes-frontend && npm start
echo.
echo The app will be available at http://localhost:3000
echo.
pause

