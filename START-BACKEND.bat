@echo off
setlocal
cd /d "%~dp0backend"

echo ================================================
echo   LB Computer Institute - Backend Server
echo ================================================
echo.

if not exist node_modules (
  echo Installing backend dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting API + website server...
echo Open this in your browser: http://localhost:5000/
echo Keep this window open while using the website.
echo.
call npm start
pause
