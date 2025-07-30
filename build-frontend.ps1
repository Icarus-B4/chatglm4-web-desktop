# Frontend Build Script für ChatGLM Web
# Dieses Script buildet das React Frontend und integriert es ins Rust Backend

Write-Host "🚀 Building ChatGLM Web Frontend..." -ForegroundColor Cyan

# Dependencies installieren
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# TypeScript Kompilierung prüfen
Write-Host "🔍 Type checking..." -ForegroundColor Yellow
npx tsc --noEmit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found" -ForegroundColor Red
    exit 1
}

# Frontend builden
Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Static files organisieren
Write-Host "📁 Organizing static files..." -ForegroundColor Yellow

# Sicherstellen, dass static Verzeichnis existiert
if (!(Test-Path "static")) {
    New-Item -ItemType Directory -Path "static" -Force
}

# Index.html ins templates Verzeichnis kopieren (für Rust-Integration)
if (!(Test-Path "templates")) {
    New-Item -ItemType Directory -Path "templates" -Force
}

if (Test-Path "static/index.html") {
    Copy-Item "static/index.html" "templates/index.html" -Force
    Write-Host "✅ Copied index.html to templates/" -ForegroundColor Green
}

# Assets-Struktur prüfen
if (Test-Path "static/assets") {
    $assetCount = (Get-ChildItem "static/assets" | Measure-Object).Count
    Write-Host "✅ Generated $assetCount asset files" -ForegroundColor Green
} else {
    Write-Host "⚠️ No assets directory found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Frontend build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Rust backend: cargo run" -ForegroundColor White
Write-Host "2. Open browser: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Development mode:" -ForegroundColor Cyan
Write-Host "- Frontend dev server: npm run dev (http://localhost:3000)" -ForegroundColor White
Write-Host "- Backend server: cargo run (http://localhost:8080)" -ForegroundColor White
