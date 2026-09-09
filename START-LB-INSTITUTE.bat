@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo   LB COMPUTER INSTITUTE - SERVER STARTUP
echo ===============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js LTS first.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo Installing backend packages...
  cd backend
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
  cd ..
)

echo.
echo Starting LB Computer Institute at http://127.0.0.1:5000/
echo MongoDB is optional for Admin Login and Add Administrator.
echo Keep the server window open while using the website.
echo.
start "LB Computer Institute" http://127.0.0.1:5000/index.html
cd backend
call npm start
pause
