# ChatGLM Web - GLM-4.5 API Client

Ein moderner Web-Client für die GLM-4.5 API mit Electron-Unterstützung, Code-Generierung und Web-Search-Funktionalität.

## 🚀 Features

- **GLM-4.5 API Integration**: Vollständige Unterstützung für die Z.AI GLM-4.5 API
- **Code-Generierung**: Automatische Erstellung von Code-Artefakten mit Claude Code
- **Web-Search**: Integrierte Web-Suche über DuckDuckGo
- **Electron App**: Desktop-Anwendung mit transparenten Fenstern
- **Real-time Chat**: Echtzeit-Chat mit Denkprozess-Simulation
- **Code-Preview**: Live-Vorschau von generiertem Code
- **ZIP-Download**: Export von Projekten als ZIP-Dateien
- **Dark/Light Theme**: Automatische Theme-Erkennung

## 🔧 Installation

### Voraussetzungen
- Node.js 18+ 
- pnpm (empfohlen) oder npm
- Git

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd chatglm-web

# Dependencies installieren
pnpm install

# API-Key konfigurieren
# Erstelle eine .env Datei im Root-Verzeichnis:
echo "VITE_GLM_API_KEY=dein_api_key_hier" > .env
```

## 🚀 Entwicklung

### Development-Server starten
```bash
pnpm dev
```

Die Anwendung läuft dann auf:
- Frontend: http://localhost:3002 (oder nächster verfügbarer Port)
- Web-Search Service: http://localhost:3004

### Electron-App starten
```bash
pnpm electron:dev
```

## 📦 Build

### Frontend Build
```bash
pnpm build
```

### Electron Build
```bash
pnpm electron:build
```

## ⚙️ Konfiguration

### API-Konfiguration
Die API-Konfiguration befindet sich in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  API_KEY: 'dein_api_key_hier',
  BASE_URL: 'https://api.z.ai/api/paas/v4',
  MODEL: 'glm-4.5',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  TIMEOUT: 60000, // 60 Sekunden
};
```

### Web-Search Service
Der Web-Search Service läuft standardmäßig auf Port 3004. Die URL ist in `src/services/toolHandler.ts` konfiguriert.

## 🐛 Bekannte Probleme & Lösungen

### 1. Port-Konflikte
**Problem**: Web-Search Service kann nicht auf Port 3003 starten
**Lösung**: Port wurde auf 3004 geändert. Alle Konfigurationen wurden entsprechend aktualisiert.

### 2. Electron Preload-Script Fehler
**Problem**: "Cannot bind an API on top of an existing property"
**Lösung**: Doppelte `contextBridge.exposeInMainWorld` Aufrufe in `electron/preload.js` wurden entfernt.

### 3. API Timeout-Fehler
**Problem**: AbortError bei API-Anfragen
**Lösung**: Timeout wurde von 30 auf 60 Sekunden erhöht und bessere Fehlerbehandlung hinzugefügt.

### 4. CSS-Syntax-Fehler
**Problem**: Doppelte CSS-Regeln in `globals.css`
**Lösung**: Doppelte Regeln wurden entfernt.

## 🔍 Troubleshooting

### API-Fehler
1. Prüfe deinen API-Key in der `.env` Datei
2. Stelle sicher, dass du eine stabile Internetverbindung hast
3. Prüfe die API-Konfiguration in `src/config/api.ts`

### Web-Search Service
1. Stelle sicher, dass der Service auf Port 3004 läuft
2. Prüfe die CORS-Konfiguration in `web-search-service/server.js`
3. Starte den Service neu: `cd web-search-service && npm start`

### Electron-Probleme
1. Prüfe die Preload-Script-Konfiguration in `electron/main.js`
2. Stelle sicher, dass alle Electron-Dependencies installiert sind
3. Starte die Electron-App neu: `pnpm electron:dev`

## 📁 Projektstruktur

```
chatglm-web/
├── src/
│   ├── components/          # React-Komponenten
│   ├── hooks/              # Custom React Hooks
│   ├── services/           # API-Services
│   ├── config/             # Konfigurationsdateien
│   ├── types/              # TypeScript-Typen
│   └── styles/             # CSS-Styles
├── electron/               # Electron-spezifische Dateien
├── web-search-service/     # Web-Search Service
├── dist-electron/          # Electron Build-Output
└── static/                 # Statische Assets
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
