# ChatGLM Web Desktop App Starter
# Einfaches Script zum Starten der App

Write-Host "🚀 ChatGLM Web Desktop App wird gestartet..." -ForegroundColor Green

# Prüfe ob Node.js installiert ist
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Node.js von https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

# Prüfe ob npm installiert ist
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm ist nicht installiert!" -ForegroundColor Red
    pause
    exit 1
}

# Installiere Dependencies falls nötig
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installiere Dependencies..." -ForegroundColor Yellow
    npm install
}

# Baue das Frontend
Write-Host "🔨 Baue Frontend..." -ForegroundColor Yellow
npm run build

# Starte Electron App
Write-Host "⚡ Starte Desktop App..." -ForegroundColor Green
npm run electron

Write-Host "✅ App gestartet!" -ForegroundColor Green 