# ChatGLM Web Application - Installationsanleitung

## Übersicht

Diese Anleitung führt Sie durch die Installation und das Starten der ChatGLM Web Application auf Windows, Linux und macOS.

## Systemanforderungen

- **Betriebssystem**: Windows 10/11, Ubuntu 20.04+, macOS 10.15+
- **RAM**: Mindestens 4 GB (8 GB empfohlen)
- **Speicherplatz**: 2 GB freier Speicherplatz
- **Internetverbindung**: Für GLM-4.5 API-Zugriff erforderlich

## Voraussetzungen

### Windows

1. **Rust installieren**:
   - Besuchen Sie https://rustup.rs/
   - Laden Sie `rustup-init.exe` herunter und führen Sie es aus
   - Folgen Sie den Installationsanweisungen

2. **Node.js installieren**:
   - Besuchen Sie https://nodejs.org/
   - Laden Sie die LTS-Version herunter (18.x oder höher)
   - Führen Sie den Installer aus

3. **Git installieren** (optional):
   - Besuchen Sie https://git-scm.com/download/win
   - Laden Sie Git für Windows herunter

### Linux (Ubuntu/Debian)

```bash
# Rust installieren
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build-Tools installieren
sudo apt-get install build-essential pkg-config libssl-dev
```

### macOS

```bash
# Rust installieren
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Node.js mit Homebrew installieren
brew install node@18
```

## Installation

### Option 1: Aus dem Quellcode bauen

1. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd chatglm-web
   ```

2. **Umgebung konfigurieren**:
   ```bash
   # .env Datei erstellen
   copy .env.example .env    # Windows
   cp .env.example .env      # Linux/macOS
   ```

3. **API-Schlüssel konfigurieren**:
   Bearbeiten Sie die `.env` Datei und tragen Sie Ihren GLM-4.5 API-Schlüssel ein:
   ```env
   GLM_API_KEY=ihr-api-schluessel-hier
   ```

4. **Anwendung bauen**:
   
   **Windows (PowerShell)**:
   ```powershell
   .\build.ps1 prod
   ```
   
   **Linux/macOS**:
   ```bash
   chmod +x build.sh
   ./build.sh prod
   ```

### Option 2: Vorkompilierte Binaries verwenden

1. **Binary herunterladen**:
   - Besuchen Sie die GitHub Releases-Seite
   - Laden Sie die passende Version für Ihr System herunter:
     - `chatglm-web-windows-x64.zip` (Windows)
     - `chatglm-web-linux-x64.tar.gz` (Linux)
     - `chatglm-web-macos-x64.tar.gz` (macOS Intel)
     - `chatglm-web-macos-arm64.tar.gz` (macOS Apple Silicon)

2. **Archiv entpacken**:
   ```bash
   # Windows
   Expand-Archive chatglm-web-windows-x64.zip -DestinationPath chatglm-web

   # Linux/macOS
   tar -xzf chatglm-web-linux-x64.tar.gz
   cd chatglm-web
   ```

3. **Konfiguration anpassen**:
   Bearbeiten Sie `config.toml` und tragen Sie Ihren API-Schlüssel ein.

## Konfiguration

### Hauptkonfiguration (config.toml)

```toml
[server]
host = "127.0.0.1"
port = 3000
timeout = 30

[chatglm]
api_url = "https://api.z.ai/v1"
api_key = ""  # Wird aus Umgebungsvariablen geladen
model = "glm-4.5"
max_tokens = 4096
temperature = 0.7
top_p = 0.9
stream = false

[cors]
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
allowed_headers = ["Content-Type", "Authorization"]

[logging]
level = "info"
format = "json"
```

### Umgebungsvariablen (.env)

```env
# GLM-4.5 API Konfiguration
GLM_API_KEY=ihr-api-schluessel-hier
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
```

## Anwendung starten

### Windows

#### Methode 1: Direkt mit der EXE-Datei

```powershell
# Im Projektverzeichnis
.\target\release\chatglm-web.exe

# Oder mit vorkompilierter Binary
.\chatglm-web.exe
```

#### Methode 2: Mit Cargo (aus Quellcode)

```powershell
cargo run --release
```

#### Methode 3: Mit PowerShell-Skript

```powershell
# Entwicklungsmodus
.\build.ps1 dev
cargo run

# Produktionsmodus
.\build.ps1 prod
.\target\release\chatglm-web.exe
```

### Linux/macOS

#### Methode 1: Direkt mit der Binary

```bash
# Im Projektverzeichnis
./target/release/chatglm-web

# Oder mit vorkompilierter Binary
./chatglm-web
```

#### Methode 2: Mit Cargo (aus Quellcode)

```bash
cargo run --release
```

#### Methode 3: Mit Build-Skript

```bash
# Entwicklungsmodus
./build.sh dev
cargo run

# Produktionsmodus
./build.sh prod
./target/release/chatglm-web
```

## Docker-Deployment

### Schnellstart mit Docker Compose

```bash
# Docker Compose installieren (falls nicht vorhanden)
# Siehe: https://docs.docker.com/compose/install/

# .env Datei konfigurieren
cp .env.example .env
# Bearbeiten Sie .env und tragen Sie Ihren API-Schlüssel ein

# Anwendung starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Anwendung stoppen
docker-compose down
```

### Manueller Docker-Build

```bash
# Image bauen
docker build -t chatglm-web .

# Container starten
docker run -d \
  --name chatglm-web \
  -p 3000:3000 \
  -e GLM_API_KEY=ihr-api-schluessel \
  chatglm-web
```

## Zugriff auf die Anwendung

Nach dem Start ist die Anwendung verfügbar unter:

- **Webinterface**: http://localhost:3000
- **API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000/ws
- **Health Check**: http://localhost:3000/health

## Problembehandlung

### Häufige Fehler

#### 1. "Permission denied" (Linux/macOS)

```bash
# Binary ausführbar machen
chmod +x chatglm-web
chmod +x build.sh
```

#### 2. "Port already in use"

```bash
# Port ändern in config.toml oder .env
SERVER_PORT=3001

# Oder anderen Prozess beenden
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID-NUMMER] /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

#### 3. "API Key not found"

- Überprüfen Sie, ob die `.env` Datei existiert
- Stellen Sie sicher, dass `GLM_API_KEY` korrekt gesetzt ist
- Prüfen Sie, ob der API-Schlüssel gültig ist

#### 4. "Failed to bind to address"

- Stellen Sie sicher, dass der Port nicht bereits verwendet wird
- Prüfen Sie Firewall-Einstellungen
- Versuchen Sie einen anderen Port

#### 5. Frontend nicht geladen

```bash
# Static files neu erstellen
npm run build
cp -r dist/* static/  # Linux/macOS
Copy-Item -Recurse dist\* static\  # Windows PowerShell
```

### Debug-Modus

```bash
# Detaillierte Logs aktivieren
export RUST_LOG=debug  # Linux/macOS
set RUST_LOG=debug     # Windows CMD
$env:RUST_LOG="debug"  # Windows PowerShell

# Anwendung starten
./chatglm-web
```

### Logs überprüfen

```bash
# Standardmäßig werden Logs in der Konsole ausgegeben
# Für Datei-Logs:
./chatglm-web > app.log 2>&1

# Docker Logs
docker-compose logs chatglm-web
```

## Performance-Tuning

### Produktionseinstellungen

```toml
# config.toml für Produktion
[server]
host = "0.0.0.0"  # Für externe Zugriffe
port = 3000
timeout = 60

[logging]
level = "warn"  # Weniger Logs
format = "compact"

[chatglm]
max_tokens = 2048  # Reduziert für bessere Performance
temperature = 0.5
```

### Systemressourcen

- **CPU**: Die Anwendung ist Single-Threaded, aber asynchron
- **RAM**: Etwa 50-100 MB Basis-RAM-Verbrauch
- **Netzwerk**: Abhängig von API-Nutzung

## Updates

### Anwendung aktualisieren

```bash
# Aus Quellcode
git pull
./build.sh prod

# Docker
docker-compose pull
docker-compose up -d

# Binary ersetzen
# Laden Sie neue Version herunter und ersetzen Sie die alte
```

## Weitere Informationen

- **API-Dokumentation**: Siehe `README.md`
- **Entwicklung**: Siehe `README_FRONTEND.md`
- **Testing**: Siehe `TESTING_REPORT.md`
- **Support**: Erstellen Sie ein Issue im GitHub-Repository

## Lizenz

[Hier Lizenzinformationen einfügen]
