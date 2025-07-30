@echo off
echo 🔧 Installiere Web-Search Service als Windows Service...
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

REM Prüfe ob pm2 installiert ist
npx pm2 --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installiere PM2 (Process Manager)...
    npm install -g pm2
)

cd web-search-service

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Installiere Playwright browsers falls nötig
if not exist "%USERPROFILE%\AppData\Local\ms-playwright" (
    echo Installing Playwright browsers...
    call npx playwright install --with-deps chromium
)

echo.
echo 🔧 Erstelle PM2 Konfiguration...
echo.

REM Erstelle PM2 Konfiguration
echo {> pm2.config.json
echo   "apps": [{>> pm2.config.json
echo     "name": "web-search-service",>> pm2.config.json
echo     "script": "server.js",>> pm2.config.json
echo     "cwd": "%CD%",>> pm2.config.json
echo     "env": {>> pm2.config.json
echo       "NODE_ENV": "production",>> pm2.config.json
echo       "PORT": "3003">> pm2.config.json
echo     },>> pm2.config.json
echo     "instances": 1,>> pm2.config.json
echo     "autorestart": true,>> pm2.config.json
echo     "watch": false,>> pm2.config.json
echo     "max_memory_restart": "1G">> pm2.config.json
echo   }]>> pm2.config.json
echo }>> pm2.config.json

echo ✅ PM2 Konfiguration erstellt!
echo.
echo 🚀 Starte Web-Search Service mit PM2...
pm2 start pm2.config.json

echo.
echo 🔧 Installiere PM2 als Windows Service...
pm2 startup
pm2 save

echo.
echo ✅ Web-Search Service wurde als Windows Service installiert!
echo.
echo Der Service wird automatisch beim Systemstart gestartet.
echo.
echo Nützliche PM2 Befehle:
echo   pm2 status          - Status aller Services anzeigen
echo   pm2 logs web-search-service - Logs anzeigen
echo   pm2 restart web-search-service - Service neu starten
echo   pm2 stop web-search-service - Service stoppen
echo   pm2 delete web-search-service - Service entfernen
echo.
pause 