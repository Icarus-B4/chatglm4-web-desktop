# ChatGLM Web Application Makefile
# Vereinfacht Build-Prozesse für Unix-basierte Systeme

.PHONY: all dev prod frontend backend docker clean test install help

# Standardziel
all: prod

# Hilfsmeldung
help:
	@echo "ChatGLM Web Application Build System"
	@echo ""
	@echo "Verfügbare Targets:"
	@echo "  all        - Alias für 'prod'"
	@echo "  dev        - Development Build (Frontend + Backend Debug)"
	@echo "  prod       - Production Build (Frontend + Backend Release)"
	@echo "  frontend   - Nur Frontend builden"
	@echo "  backend    - Nur Backend builden (Debug)"
	@echo "  release    - Nur Backend builden (Release)"
	@echo "  docker     - Docker Image erstellen"
	@echo "  clean      - Build-Artefakte löschen"
	@echo "  test       - Tests ausführen"
	@echo "  install    - Dependencies installieren"
	@echo "  lint       - Code-Qualität prüfen"
	@echo "  format     - Code formatieren"
	@echo "  run        - Anwendung starten (Development)"
	@echo "  run-prod   - Anwendung starten (Production)"
	@echo "  help       - Diese Hilfe anzeigen"

# Voraussetzungen prüfen
check-deps:
	@command -v node >/dev/null 2>&1 || { echo "Node.js ist nicht installiert" >&2; exit 1; }
	@command -v cargo >/dev/null 2>&1 || { echo "Rust/Cargo ist nicht installiert" >&2; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "npm ist nicht installiert" >&2; exit 1; }

# Dependencies installieren
install: check-deps
	@echo "Installiere Frontend Dependencies..."
	npm ci
	@echo "Frontend Dependencies installiert ✓"

# Frontend builden
frontend: install
	@echo "Building Frontend..."
	npm run build
	@echo "Frontend Build abgeschlossen ✓"

# Backend Debug builden
backend: check-deps
	@echo "Building Backend (Debug)..."
	cargo build
	@echo "Backend Debug Build abgeschlossen ✓"

# Backend Release builden
release: check-deps
	@echo "Building Backend (Release)..."
	cargo build --release
	@echo "Backend Release Build abgeschlossen ✓"

# Development Build
dev: install frontend backend
	@echo "Development Build abgeschlossen ✓"
	@echo "Starte mit: make run oder cargo run"

# Production Build
prod: install frontend release
	@echo "Kopiere Static Files nach static/..."
	@mkdir -p static
	@cp -r dist/* static/ 2>/dev/null || true
	@echo "Production Build abgeschlossen ✓"
	@echo "Binary verfügbar: target/release/chatglm-web"

# Tests ausführen
test: check-deps
	@echo "Führe Frontend Tests aus..."
	npm run test:run
	@echo "Führe Backend Tests aus..."
	cargo test
	@echo "Alle Tests abgeschlossen ✓"

# Code formatieren
format: check-deps
	@echo "Formatiere Rust Code..."
	cargo fmt
	@echo "Formatiere Frontend Code..."
	npm run format 2>/dev/null || echo "Frontend formatting nicht verfügbar"
	@echo "Code-Formatierung abgeschlossen ✓"

# Linting
lint: check-deps
	@echo "Prüfe Rust Code (Clippy)..."
	cargo clippy -- -D warnings
	@echo "Prüfe Frontend Code..."
	npm run lint 2>/dev/null || echo "Frontend linting nicht verfügbar"
	@echo "Code-Qualitätsprüfung abgeschlossen ✓"

# Build-Artefakte löschen
clean:
	@echo "Lösche Build-Artefakte..."
	rm -rf dist/
	rm -rf static/
	rm -rf node_modules/.cache/
	cargo clean
	@echo "Build-Artefakte gelöscht ✓"

# Docker Image erstellen
docker:
	@echo "Erstelle Docker Image..."
	@if [ ! -f .env ]; then \
		echo "Warnung: .env Datei nicht gefunden - kopiere .env.example"; \
		cp .env.example .env; \
	fi
	docker build -t chatglm-web:latest .
	@echo "Docker Image erstellt: chatglm-web:latest ✓"

# Anwendung starten (Development)
run: dev
	@echo "Starte Anwendung (Development)..."
	cargo run

# Anwendung starten (Production)
run-prod: prod
	@echo "Starte Anwendung (Production)..."
	./target/release/chatglm-web

# Benchmark Tests
bench: check-deps
	@echo "Führe Performance-Tests aus..."
	cargo bench
	@echo "Performance-Tests abgeschlossen ✓"

# Security Audit
audit: check-deps
	@echo "Führe Security Audit aus..."
	cargo audit || echo "cargo-audit nicht installiert - installiere mit: cargo install cargo-audit"
	npm audit --audit-level moderate
	@echo "Security Audit abgeschlossen ✓"

# Abhängigkeiten aktualisieren
update: check-deps
	@echo "Aktualisiere Dependencies..."
	npm update
	cargo update
	@echo "Dependencies aktualisiert ✓"

# Vollständiger CI/CD-Workflow
ci: clean install lint test prod
	@echo "CI/CD Pipeline abgeschlossen ✓"

# Release vorbereiten
prepare-release: ci audit
	@echo "Release-Vorbereitung abgeschlossen ✓"
	@echo "Führe aus: git tag vX.Y.Z && git push origin vX.Y.Z"
