# ChatGLM Web Application Build Script (PowerShell)
# Dieses Skript baut die Anwendung sowohl für Entwicklung als auch Produktion

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "frontend", "backend", "docker", "clean", "test", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [ValidateSet("debug", "release")]
    [string]$Mode = "debug"
)

# Farben für Output
$colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Logging-Funktionen
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $colors.Red
}

# Hilfsfunktion anzeigen
function Show-Help {
    Write-Host "ChatGLM Web Application Build Script (PowerShell)" -ForegroundColor $colors.White
    Write-Host ""
    Write-Host "Usage: .\build.ps1 [COMMAND] [OPTIONS]" -ForegroundColor $colors.White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor $colors.White
    Write-Host "  dev        Build für Entwicklung (Frontend + Backend)" -ForegroundColor $colors.White
    Write-Host "  prod       Build für Produktion (optimiert)" -ForegroundColor $colors.White
    Write-Host "  frontend   Nur Frontend builden" -ForegroundColor $colors.White
    Write-Host "  backend    Nur Backend builden [debug|release]" -ForegroundColor $colors.White
    Write-Host "  docker     Docker Image erstellen" -ForegroundColor $colors.White
    Write-Host "  clean      Build-Artefakte löschen" -ForegroundColor $colors.White
    Write-Host "  test       Tests ausführen" -ForegroundColor $colors.White
    Write-Host "  help       Diese Hilfe anzeigen" -ForegroundColor $colors.White
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor $colors.White
    Write-Host "  .\build.ps1 dev" -ForegroundColor $colors.White
    Write-Host "  .\build.ps1 backend release" -ForegroundColor $colors.White
    Write-Host "  .\build.ps1 docker" -ForegroundColor $colors.White
}

# Voraussetzungen prüfen
function Test-Prerequisites {
    Write-Info "Prüfe Voraussetzungen..."
    
    # Node.js prüfen
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js ist nicht installiert"
        exit 1
    }
    
    # Rust prüfen
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Error "Rust/Cargo ist nicht installiert"
        exit 1
    }
    
    # npm prüfen
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm ist nicht installiert"
        exit 1
    }
    
    Write-Success "Alle Voraussetzungen erfüllt"
}

# Frontend Dependencies installieren
function Install-FrontendDeps {
    Write-Info "Installiere Frontend Dependencies..."
    
    try {
        npm ci
        Write-Success "Frontend Dependencies installiert"
    }
    catch {
        Write-Error "Fehler beim Installieren der Frontend Dependencies: $_"
        exit 1
    }
}

# Frontend builden
function Build-Frontend {
    Write-Info "Building Frontend..."
    
    try {
        npm run build
        Write-Success "Frontend Build abgeschlossen"
    }
    catch {
        Write-Error "Fehler beim Frontend Build: $_"
        exit 1
    }
}

# Backend builden
function Build-Backend {
    param([string]$BuildMode = "debug")
    
    Write-Info "Building Backend ($BuildMode)..."
    
    try {
        if ($BuildMode -eq "release") {
            cargo build --release
        } else {
            cargo build
        }
        Write-Success "Backend Build abgeschlossen"
    }
    catch {
        Write-Error "Fehler beim Backend Build: $_"
        exit 1
    }
}

# Tests ausführen
function Invoke-Tests {
    Write-Info "Führe Tests aus..."
    
    try {
        # Frontend Tests
        Write-Info "Frontend Tests..."
        npm run test:run
        
        # Backend Tests
        Write-Info "Backend Tests..."
        cargo test
        
        Write-Success "Alle Tests erfolgreich"
    }
    catch {
        Write-Error "Tests fehlgeschlagen: $_"
        exit 1
    }
}

# Build-Artefakte löschen
function Clear-BuildArtifacts {
    Write-Info "Lösche Build-Artefakte..."
    
    try {
        # Frontend
        if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
        if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
        
        # Backend
        cargo clean
        
        # Static files
        if (Test-Path "static") { Remove-Item -Recurse -Force "static" }
        
        Write-Success "Build-Artefakte gelöscht"
    }
    catch {
        Write-Error "Fehler beim Löschen der Build-Artefakte: $_"
        exit 1
    }
}

# Docker Image erstellen
function Build-DockerImage {
    Write-Info "Erstelle Docker Image..."
    
    # .env Datei prüfen
    if (-not (Test-Path ".env")) {
        Write-Warning ".env Datei nicht gefunden - erstelle Beispiel"
        New-EnvExample
    }
    
    try {
        # Docker Image builden
        docker build -t chatglm-web:latest .
        Write-Success "Docker Image erstellt: chatglm-web:latest"
    }
    catch {
        Write-Error "Fehler beim Docker Build: $_"
        exit 1
    }
}

# .env Beispiel erstellen
function New-EnvExample {
    $envContent = @"
# GLM-4.5 API Konfiguration
GLM_API_KEY=your-z-ai-api-key-here
GLM_API_URL=https://api.z.ai/v1
GLM_MODEL=glm-4.5
GLM_MAX_TOKENS=4096
GLM_TEMPERATURE=0.7
GLM_TOP_P=0.9
GLM_STREAM=false
GLM_THINKING_ENABLED=true

# Server Konfiguration
SERVER_HOST=127.0.0.1
SERVER_PORT=3000

# Logging
RUST_LOG=info
"@
    
    $envContent | Out-File -FilePath ".env.example" -Encoding utf8
    Write-Info ".env.example erstellt - kopiere zu .env und konfiguriere"
}

# Entwicklungs-Build
function Build-Development {
    Write-Info "Starte Entwicklungs-Build..."
    
    Test-Prerequisites
    Install-FrontendDeps
    Build-Frontend
    Build-Backend "debug"
    
    Write-Success "Entwicklungs-Build abgeschlossen"
    Write-Info "Starte mit: cargo run"
}

# Produktions-Build
function Build-Production {
    Write-Info "Starte Produktions-Build..."
    
    Test-Prerequisites
    Install-FrontendDeps
    Build-Frontend
    Build-Backend "release"
    
    # Static files kopieren
    if (-not (Test-Path "static")) {
        New-Item -ItemType Directory -Path "static" | Out-Null
    }
    
    if (Test-Path "dist") {
        Copy-Item -Recurse -Force "dist\*" "static\"
    }
    
    Write-Success "Produktions-Build abgeschlossen"
    Write-Info "Binary: target\release\chatglm-web.exe"
}

# Hauptlogik
switch ($Command) {
    "dev" {
        Build-Development
    }
    "prod" {
        Build-Production
    }
    "frontend" {
        Test-Prerequisites
        Install-FrontendDeps
        Build-Frontend
    }
    "backend" {
        Test-Prerequisites
        Build-Backend $Mode
    }
    "docker" {
        Build-DockerImage
    }
    "clean" {
        Clear-BuildArtifacts
    }
    "test" {
        Test-Prerequisites
        Invoke-Tests
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unbekannte Option: $Command"
        Show-Help
        exit 1
    }
}
