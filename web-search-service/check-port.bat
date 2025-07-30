@echo off
echo 🔍 Prüfe Port Verfügbarkeit...
echo.

set PORT=3003

REM Prüfe ob Port 3003 belegt ist
netstat -an | find ":%PORT%" >nul
if %errorlevel% equ 0 (
    echo ❌ Port %PORT% ist bereits belegt!
    echo.
    echo Mögliche Lösungen:
    echo 1. Beende andere Anwendungen die Port %PORT% verwenden
    echo 2. Verwende einen anderen Port: set PORT=3004
    echo 3. Starte den Service mit: npm start
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Port %PORT% ist verfügbar!
    echo.
)

echo 🚀 Port %PORT% kann verwendet werden.
echo. 