# ChatGLM Web Electron Build Script für Windows
# PowerShell Script zum Bauen der Desktop-App

Write-Host "🚀 ChatGLM Web Electron Build Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Prüfe ob Node.js installiert ist
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Node.js von https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Prüfe Node.js Version
$nodeVersion = node --version
Write-Host "📦 Node.js Version: $nodeVersion" -ForegroundColor Cyan

# Prüfe ob npm installiert ist
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm ist nicht installiert!" -ForegroundColor Red
    exit 1
}

# Prüfe npm Version
$npmVersion = npm --version
Write-Host "📦 npm Version: $npmVersion" -ForegroundColor Cyan

# Installiere Dependencies
Write-Host "📥 Installiere Dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Installieren der Dependencies!" -ForegroundColor Red
    exit 1
}

# Baue das Frontend
Write-Host "🔨 Baue Frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Bauen des Frontends!" -ForegroundColor Red
    exit 1
}

# Erstelle Icon-Dateien (falls nicht vorhanden)
Write-Host "🎨 Erstelle Icons..." -ForegroundColor Yellow
if (!(Test-Path "electron/assets/icon.ico")) {
    Write-Host "⚠️  Icon-Datei nicht gefunden. Verwende Standard-Icon." -ForegroundColor Yellow
}

# Baue Electron App
Write-Host "⚡ Baue Electron App..." -ForegroundColor Yellow
npm run electron:build:win

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Bauen der Electron App!" -ForegroundColor Red
    exit 1
}

# Prüfe ob Build erfolgreich war
if (Test-Path "dist-electron") {
    Write-Host "✅ Build erfolgreich!" -ForegroundColor Green
    Write-Host "📁 Ausgabeverzeichnis: dist-electron/" -ForegroundColor Cyan
    
    # Zeige erstellte Dateien
    $buildFiles = Get-ChildItem "dist-electron" -Recurse -File
    Write-Host "📋 Erstellte Dateien:" -ForegroundColor Cyan
    foreach ($file in $buildFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        Write-Host "   $($file.Name) ($size MB)" -ForegroundColor White
    }
    
    # Öffne Ausgabeverzeichnis
    Write-Host "🔍 Öffne Ausgabeverzeichnis..." -ForegroundColor Yellow
    Start-Process "dist-electron"
} else {
    Write-Host "❌ Build-Verzeichnis nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Build abgeschlossen!" -ForegroundColor Green
Write-Host "Die ausführbare Datei befindet sich im dist-electron/ Verzeichnis." -ForegroundColor Cyan 