@echo off
cd /d "%~dp0"
echo Shab-E-Lazzat Order System
echo Starting server on http://localhost:9808 ...
echo Keep this window OPEN. Then open the browser tab it launches.
echo.
start "" http://localhost:9808
node server.js
echo.
echo Server stopped. Closing in 5s...
timeout /t 5 >nul