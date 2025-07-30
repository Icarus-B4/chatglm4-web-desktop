# ChatGLM Web - Windows Schnellstart-Anleitung

## 🚀 Schneller Start für Windows-Benutzer

Diese Anleitung zeigt Ihnen, wie Sie die ChatGLM Web-Anwendung in wenigen Minuten auf Windows zum Laufen bringen.

## ⚡ Option 1: Einfachster Weg (Vorkompilierte EXE)

### Schritt 1: Binary herunterladen
1. Gehen Sie zu den [GitHub Releases](https://github.com/your-repo/chatglm-web/releases)
2. Laden Sie `chatglm-web-windows-x64.zip` herunter
3. Entpacken Sie die ZIP-Datei in einen Ordner Ihrer Wahl

### Schritt 2: Konfiguration
1. Öffnen Sie den entpackten Ordner
2. Bearbeiten Sie `config.toml` mit einem Texteditor
3. Tragen Sie Ihren GLM-4.5 API-Schlüssel ein:
   ```toml
   [chatglm]
   api_key = "IHR_API_SCHLUESSEL_HIER"
   ```

### Schritt 3: Starten
1. Öffnen Sie PowerShell oder Eingabeaufforderung im Ordner
2. Führen Sie aus:
   ```cmd
   chatglm-web.exe
   ```
3. Öffnen Sie http://localhost:3000 in Ihrem Browser

**Das war's! 🎉**

---

## 🛠️ Option 2: Aus Quellcode bauen

### Voraussetzungen installieren

#### Rust installieren
1. Besuchen Sie https://rustup.rs/
2. Laden Sie `rustup-init.exe` herunter
3. Führen Sie den Installer aus und folgen Sie den Anweisungen
4. Starten Sie ein neues PowerShell-Fenster

#### Node.js installieren
1. Besuchen Sie https://nodejs.org/
2. Laden Sie die LTS-Version herunter (18.x oder höher)
3. Führen Sie den Installer aus

### Projekt klonen und bauen

```powershell
# Repository klonen (oder ZIP herunterladen und entpacken)
git clone https://github.com/your-repo/chatglm-web.git
cd chatglm-web

# Umgebungsvariablen konfigurieren
copy .env.example .env
# Bearbeiten Sie .env und tragen Sie Ihren API-Schlüssel ein

# Anwendung bauen
.\build.ps1 prod

# Anwendung starten
.\target\release\chatglm-web.exe
```

---

## 🐳 Option 3: Mit Docker (Empfohlen für Entwickler)

### Docker Desktop installieren
1. Laden Sie Docker Desktop von https://docker.com/products/docker-desktop herunter
2. Installieren Sie Docker Desktop
3. Starten Sie Docker Desktop

### Mit Docker Compose starten
```powershell
# Repository klonen
git clone https://github.com/your-repo/chatglm-web.git
cd chatglm-web

# Umgebungsvariablen konfigurieren
copy .env.example .env
# Bearbeiten Sie .env und tragen Sie Ihren API-Schlüssel ein

# Mit Docker starten
docker-compose up -d
```

---

## 🔧 Konfiguration

### Mindest-Konfiguration (.env)
```env
GLM_API_KEY=ihr-api-schluessel-hier
```

### Erweiterte Konfiguration
```env
# GLM-4.5 API
GLM_API_KEY=ihr-api-schluessel-hier
GLM_MODEL=glm-4.5
GLM_MAX_TOKENS=4096
GLM_TEMPERATURE=0.7

# Server
SERVER_HOST=127.0.0.1
SERVER_PORT=3000

# Logging
RUST_LOG=info
```

---

## 🌐 Zugriff auf die Anwendung

Nach dem Start ist die Anwendung verfügbar unter:
- **Hauptanwendung**: http://localhost:3000
- **API-Endpunkte**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

---

## ❓ Häufige Probleme und Lösungen

### Problem: "chatglm-web.exe funktioniert nicht"
**Lösung**: 
1. Überprüfen Sie, ob alle Visual C++ Redistributables installiert sind
2. Führen Sie die EXE als Administrator aus
3. Prüfen Sie die Firewall-Einstellungen

### Problem: "Port 3000 ist bereits in Verwendung"
**Lösung**: 
```powershell
# Anderen Port verwenden
$env:SERVER_PORT="3001"
.\chatglm-web.exe
```

### Problem: "API Key nicht gefunden"
**Lösung**:
1. Stellen Sie sicher, dass die `.env` Datei im gleichen Ordner wie die EXE ist
2. Überprüfen Sie, ob `GLM_API_KEY` korrekt gesetzt ist
3. Keine Leerzeichen vor oder nach dem API-Schlüssel

### Problem: "Frontend lädt nicht"
**Lösung**:
```powershell
# Static files prüfen
dir static
# Falls leer, Frontend neu bauen:
npm run build
Copy-Item -Recurse dist\* static\
```

---

## 🚀 Entwicklungsmodus starten

Für Entwickler, die am Code arbeiten möchten:

```powershell
# Dependencies installieren
npm install

# Frontend und Backend parallel starten
# Terminal 1: Frontend Dev Server
npm run dev

# Terminal 2: Backend
cargo run
```

---

## 📋 Nützliche Befehle

```powershell
# Anwendung bauen
.\build.ps1 prod

# Tests ausführen
.\build.ps1 test

# Docker Image erstellen
.\build.ps1 docker

# Alle Build-Artefakte löschen
.\build.ps1 clean

# Hilfe anzeigen
.\build.ps1 help
```

---

## 🔍 Debug-Modus

Für detaillierte Logs:

```powershell
# Debug-Logs aktivieren
$env:RUST_LOG="debug"
.\chatglm-web.exe
```

---

## 📞 Support

Falls Sie Probleme haben:
1. Prüfen Sie die [Vollständige Installationsanleitung](INSTALLATION.md)
2. Schauen Sie in die [API-Dokumentation](README.md)
3. Erstellen Sie ein Issue auf GitHub

---

## 🎯 Nächste Schritte

Nach der erfolgreichen Installation können Sie:
- Die Web-Oberfläche unter http://localhost:3000 erkunden
- API-Endpunkte unter http://localhost:3000/api testen
- Die Konfiguration nach Ihren Wünschen anpassen
- WebSocket-Verbindungen für Echtzeit-Chat nutzen

**Viel Spaß mit ChatGLM Web! 🚀**
