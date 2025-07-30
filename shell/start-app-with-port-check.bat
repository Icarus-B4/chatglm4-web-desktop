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

REM Prüfe Port-Konflikte
echo 🔍 Prüfe Port Verfügbarkeit...
netstat -an | find ":3003" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3003 ist belegt. Versuche alternativen Port...
    set WEB_SEARCH_PORT=3004
    echo 🔄 Web-Search Service wird auf Port 3004 gestartet...
) else (
    set WEB_SEARCH_PORT=3003
    echo ✅ Port 3003 ist verfügbar.
)

echo.

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo 📦 Installiere Dependencies...
    npm install
)

REM Installiere Web-Search Service Dependencies falls nötig
if not exist "web-search-service/node_modules" (
    echo 📦 Installiere Web-Search Service Dependencies...
    cd web-search-service
    npm install
    cd ..
)

REM Installiere Playwright Browser falls nötig
echo 🔍 Installiere Playwright Browser...
cd web-search-service
npx playwright install --with-deps chromium
cd ..

REM Baue das Frontend
echo 🔨 Baue Frontend...
npm run build

REM Starte Web-Search Service im Hintergrund mit dynamischem Port
echo 🔍 Starte Web-Search Service auf Port %WEB_SEARCH_PORT%...
start "Web-Search Service" cmd /c "cd web-search-service && set PORT=%WEB_SEARCH_PORT% && npm start"

REM Warte kurz damit der Service starten kann
timeout /t 5 /nobreak >nul

REM Starte Electron App
echo ⚡ Starte Desktop App...
npm run electron

echo ✅ App gestartet!
echo.
echo Hinweis: Der Web-Search Service läuft im Hintergrund auf http://localhost:%WEB_SEARCH_PORT%
echo Schließe das "Web-Search Service" Fenster nur, wenn du die App komplett beenden möchtest.
pause 