@echo off
echo 🎨 Aktualisiere Electron App Icon...
echo.

REM Prüfe ob das SVG-Icon existiert
if not exist "electron\assets\icon.svg" (
    echo ❌ SVG-Icon nicht gefunden!
    echo Bitte führe zuerst aus: node scripts/generate-icons.js
    pause
    exit /b 1
)

echo ✅ SVG-Icon gefunden: electron\assets\icon.svg
echo.

echo 📋 Optionen zum Konvertieren:
echo.
echo 1. Online-Konverter verwenden:
echo    - Öffne https://convertio.co/svg-png/
echo    - Lade electron\assets\icon.svg hoch
echo    - Konvertiere zu PNG 512x512
echo    - Speichere als electron\assets\icon.png
echo.
echo 2. Mit Node.js (falls installiert):
echo    npm install -g svgexport
echo    svgexport electron\assets\icon.svg electron\assets\icon.png 512:512
echo.
echo 3. Mit Inkscape (falls installiert):
echo    inkscape electron\assets\icon.svg --export-filename=electron\assets\icon.png --export-width=512 --export-height=512
echo.

echo 🔧 Nach der Konvertierung:
echo - Ersetze alle icon-*.png Dateien in electron\assets\
echo - Erstelle verschiedene Größen: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
echo - Baue die App neu: npm run electron:build
echo.

pause 