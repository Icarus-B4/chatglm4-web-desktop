@echo off
echo 🔍 Starte Web-Search Service...
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

cd web-search-service

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Fehler beim Installieren der Dependencies!
        pause
        exit /b 1
    )
)

REM Installiere Playwright browsers falls nötig
if not exist "%USERPROFILE%\AppData\Local\ms-playwright" (
    echo Installing Playwright browsers...
    call npx playwright install --with-deps chromium
    if errorlevel 1 (
        echo ❌ Fehler beim Installieren von Playwright!
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Starting Web-Search Service on http://localhost:3003
echo.

REM Prüfe Port Verfügbarkeit
call check-port.bat
if errorlevel 1 (
    echo ❌ Port 3003 ist belegt. Versuche alternativen Port...
    set PORT=3004
    echo 🔄 Verwende Port 3004...
)

echo WICHTIG: Lasse dieses Fenster offen! Der Service muss laufen, damit die Web-Suche funktioniert.
echo.

REM Starte den Service
call npm start

REM Falls der Service beendet wird, warte auf Benutzereingabe
echo.
echo Web-Search Service wurde beendet.
pause
