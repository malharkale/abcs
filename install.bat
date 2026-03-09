@echo off
REM Installation and setup script for Windows

echo 🚀 CallForFree Setup Script
echo ============================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install it from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js is installed
for /f "tokens=*" %%i in ('node --version') do echo   Version: %%i

echo.
echo 📦 Installing Backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
cd ..

echo.
echo 📦 Installing Frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo   Terminal 1: cd backend ^&^& npm run dev
echo   Terminal 2: cd frontend ^&^& npm start
echo.
echo Then visit: http://localhost:4200
