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

# Installiere Web-Search Service Dependencies falls nötig
if (!(Test-Path "web-search-service/node_modules")) {
    Write-Host "📦 Installiere Web-Search Service Dependencies..." -ForegroundColor Yellow
    Set-Location "web-search-service"
    npm install
    Set-Location ".."
}

# Installiere Playwright Browser falls nötig
Write-Host "🔍 Installiere Playwright Browser..." -ForegroundColor Yellow
Set-Location "web-search-service"
npx playwright install --with-deps chromium
Set-Location ".."

# Baue das Frontend
Write-Host "🔨 Baue Frontend..." -ForegroundColor Yellow
npm run build

# Starte Web-Search Service im Hintergrund
Write-Host "🔍 Starte Web-Search Service..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd web-search-service && npm start" -WindowStyle Normal -Name "Web-Search Service"

# Warte kurz damit der Service starten kann
Start-Sleep -Seconds 3

# Starte Electron App
Write-Host "⚡ Starte Desktop App..." -ForegroundColor Green
npm run electron

Write-Host "✅ App gestartet!" -ForegroundColor Green
Write-Host ""
Write-Host "Hinweis: Der Web-Search Service läuft im Hintergrund auf http://localhost:3003" -ForegroundColor Cyan
Write-Host "Schließe das 'Web-Search Service' Fenster nur, wenn du die App komplett beenden möchtest." -ForegroundColor Yellow 