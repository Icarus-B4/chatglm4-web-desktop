#!/bin/bash

# ChatGLM Web Application Build Script
# Dieses Skript baut die Anwendung sowohl für Entwicklung als auch Produktion

set -e  # Exit bei Fehlern

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Hilfsfunktion anzeigen
show_help() {
    echo "ChatGLM Web Application Build Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev        Build für Entwicklung (Frontend + Backend)"
    echo "  prod       Build für Produktion (optimiert)"
    echo "  frontend   Nur Frontend builden"
    echo "  backend    Nur Backend builden"
    echo "  docker     Docker Image erstellen"
    echo "  clean      Build-Artefakte löschen"
    echo "  test       Tests ausführen"
    echo "  help       Diese Hilfe anzeigen"
    echo ""
}

# Voraussetzungen prüfen
check_prerequisites() {
    log_info "Prüfe Voraussetzungen..."
    
    # Node.js prüfen
    if ! command -v node &> /dev/null; then
        log_error "Node.js ist nicht installiert"
        exit 1
    fi
    
    # Rust prüfen
    if ! command -v cargo &> /dev/null; then
        log_error "Rust/Cargo ist nicht installiert"
        exit 1
    fi
    
    # npm prüfen
    if ! command -v npm &> /dev/null; then
        log_error "npm ist nicht installiert"
        exit 1
    fi
    
    log_success "Alle Voraussetzungen erfüllt"
}

# Frontend Dependencies installieren
install_frontend_deps() {
    log_info "Installiere Frontend Dependencies..."
    npm ci
    log_success "Frontend Dependencies installiert"
}

# Frontend builden
build_frontend() {
    log_info "Building Frontend..."
    npm run build
    log_success "Frontend Build abgeschlossen"
}

# Backend builden
build_backend() {
    local mode=${1:-debug}
    
    log_info "Building Backend ($mode)..."
    
    if [ "$mode" = "release" ]; then
        cargo build --release
    else
        cargo build
    fi
    
    log_success "Backend Build abgeschlossen"
}

# Tests ausführen
run_tests() {
    log_info "Führe Tests aus..."
    
    # Frontend Tests
    log_info "Frontend Tests..."
    npm run test:run
    
    # Backend Tests
    log_info "Backend Tests..."
    cargo test
    
    log_success "Alle Tests erfolgreich"
}

# Build-Artefakte löschen
clean_build() {
    log_info "Lösche Build-Artefakte..."
    
    # Frontend
    rm -rf dist/
    rm -rf node_modules/.cache/
    
    # Backend
    cargo clean
    
    # Static files
    rm -rf static/
    
    log_success "Build-Artefakte gelöscht"
}

# Docker Image erstellen
build_docker() {
    log_info "Erstelle Docker Image..."
    
    # .env Datei prüfen
    if [ ! -f .env ]; then
        log_warning ".env Datei nicht gefunden - erstelle Beispiel"
        create_env_example
    fi
    
    # Docker Image builden
    docker build -t chatglm-web:latest .
    
    log_success "Docker Image erstellt: chatglm-web:latest"
}

# .env Beispiel erstellen
create_env_example() {
    cat > .env.example << 'EOF'
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
EOF
    log_info ".env.example erstellt - kopiere zu .env und konfiguriere"
}

# Entwicklungs-Build
build_dev() {
    log_info "Starte Entwicklungs-Build..."
    
    check_prerequisites
    install_frontend_deps
    build_frontend
    build_backend "debug"
    
    log_success "Entwicklungs-Build abgeschlossen"
    log_info "Starte mit: cargo run"
}

# Produktions-Build
build_prod() {
    log_info "Starte Produktions-Build..."
    
    check_prerequisites
    install_frontend_deps
    build_frontend
    build_backend "release"
    
    # Static files kopieren
    mkdir -p static
    cp -r dist/* static/ 2>/dev/null || true
    
    log_success "Produktions-Build abgeschlossen"
    log_info "Binary: target/release/chatglm-web"
}

# Hauptlogik
case "${1:-help}" in
    dev)
        build_dev
        ;;
    prod)
        build_prod
        ;;
    frontend)
        check_prerequisites
        install_frontend_deps
        build_frontend
        ;;
    backend)
        check_prerequisites
        build_backend "${2:-debug}"
        ;;
    docker)
        build_docker
        ;;
    clean)
        clean_build
        ;;
    test)
        check_prerequisites
        run_tests
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unbekannte Option: $1"
        show_help
        exit 1
        ;;
esac
