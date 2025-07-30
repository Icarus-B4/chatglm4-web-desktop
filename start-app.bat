@echo off
echo 🚀 ChatGLM Web Desktop App wird gestartet...
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo 📦 Installiere Dependencies...
    npm install
)

REM Baue das Frontend
echo 🔨 Baue Frontend...
npm run build

REM Starte Electron App
echo ⚡ Starte Desktop App...
npm run electron

echo ✅ App gestartet!
pause 