@echo off
echo 🛑 Beende alle ChatGLM Web Services...
echo.

REM Beende Web-Search Service Prozesse
echo 🔍 Beende Web-Search Service...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Web-Search Service*" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq *web-search*" >nul 2>&1

REM Beende Electron Prozesse
echo ⚡ Beende Electron App...
taskkill /f /im electron.exe >nul 2>&1

REM Beende Vite Dev Server
echo 🔧 Beende Vite Dev Server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq *vite*" >nul 2>&1

REM Beende alle Node.js Prozesse die auf den relevanten Ports laufen
echo 🌐 Beende Prozesse auf Port 3003 und 3004...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3003"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3004"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ✅ Alle Services wurden beendet!
echo.
pause 