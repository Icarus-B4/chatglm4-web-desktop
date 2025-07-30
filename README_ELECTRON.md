# ChatGLM Web - Desktop App

Eine moderne Desktop-Anwendung für ChatGLM Web, erstellt mit Electron.

## 🚀 Features

- **Native Desktop App**: Vollständige Desktop-Integration
- **Moderne UI**: React + Tailwind CSS + Shadcn/ui
- **Cross-Platform**: Windows, macOS, Linux
- **Sichere Architektur**: Context Isolation, keine Node.js-Integration im Renderer
- **Native Menüs**: Vollständige Menüleiste mit Tastenkürzeln
- **Auto-Updates**: Unterstützung für automatische Updates (konfigurierbar)

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Windows 10+ (für Windows Build)
- macOS 10.14+ (für macOS Build)
- Linux (für Linux Build)

## 🛠️ Installation & Entwicklung

### 1. Dependencies installieren

```bash
npm install
```

### 2. Entwicklung starten

```bash
# Startet Vite Dev Server + Electron
npm run electron:dev
```

### 3. App testen

```bash
# Nur Electron (benötigt bereits laufenden Vite Server)
npm run electron
```

## 🏗️ Build

### Windows

```bash
# Automatisches Build-Script
./build-electron.ps1

# Oder manuell
npm run electron:build:win
```

### macOS

```bash
npm run electron:build:mac
```

### Linux

```bash
npm run electron:build:linux
```

### Alle Plattformen

```bash
npm run electron:build
```

## 📁 Projektstruktur

```
├── electron/
│   ├── main.js          # Haupt-Electron-Prozess
│   ├── preload.js       # Preload-Script für sichere IPC
│   └── assets/
│       ├── icon.svg     # App-Icon (SVG)
│       ├── icon.ico     # Windows Icon
│       ├── icon.icns    # macOS Icon
│       └── icon.png     # Linux Icon
├── src/                 # React Frontend
├── dist/                # Gebaute Frontend-Dateien
├── dist-electron/       # Gebaute Electron-App
└── package.json         # Konfiguration
```

## ⚙️ Konfiguration

### Electron Builder Konfiguration

Die Build-Konfiguration befindet sich in `package.json`:

```json
{
  "build": {
    "appId": "com.chatglm.web",
    "productName": "ChatGLM Web",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "electron/**/*",
      "dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "electron/assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "electron/assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "electron/assets/icon.png"
    }
  }
}
```

### Sicherheit

- **Context Isolation**: Aktiviert
- **Node Integration**: Deaktiviert
- **Remote Module**: Deaktiviert
- **Preload Script**: Für sichere IPC-Kommunikation

## 🎨 Anpassungen

### Icon ändern

1. Ersetze die Dateien in `electron/assets/`
2. Verwende die richtigen Formate:
   - Windows: `.ico` (256x256)
   - macOS: `.icns` (512x512)
   - Linux: `.png` (512x512)

### App-Name ändern

Ändere in `package.json`:

```json
{
  "build": {
    "productName": "Dein App Name"
  }
}
```

### Menü anpassen

Bearbeite `electron/main.js` - `createMenu()` Funktion.

## 🔧 Troubleshooting

### Build-Fehler

1. **Node.js Version**: Stelle sicher, dass Node.js 18+ installiert ist
2. **Dependencies**: Führe `npm install` erneut aus
3. **Cache**: Lösche `node_modules` und `package-lock.json`, dann `npm install`

### Runtime-Fehler

1. **DevTools öffnen**: `Ctrl+Shift+I` (Windows/Linux) oder `Cmd+Option+I` (macOS)
2. **Logs prüfen**: Schau in die Konsole für Fehlermeldungen

### Icon-Probleme

1. **Format prüfen**: Verwende die richtigen Dateiformate
2. **Größe**: Icons sollten mindestens 256x256 Pixel haben
3. **Pfad**: Stelle sicher, dass die Icon-Pfade in `package.json` korrekt sind

## 📦 Distribution

### Windows

Die App wird als NSIS-Installer erstellt:
- `ChatGLM Web Setup.exe` - Installer
- Desktop-Shortcut wird automatisch erstellt
- Start-Menü-Eintrag wird erstellt

### macOS

Die App wird als DMG erstellt:
- `ChatGLM Web.dmg` - Disk Image
- Drag & Drop Installation

### Linux

Die App wird als AppImage erstellt:
- `ChatGLM Web.AppImage` - Portable App
- Keine Installation erforderlich

## 🔄 Updates

Für automatische Updates:

1. Konfiguriere einen Update-Server
2. Füge Update-Logik in `main.js` hinzu
3. Verwende `electron-updater`

## 📝 Lizenz

Siehe Haupt-Lizenz-Datei des Projekts.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Mache deine Änderungen
4. Teste die App
5. Erstelle einen Pull Request

## 📞 Support

Bei Problemen:
1. Prüfe die Troubleshooting-Sektion
2. Öffne ein Issue auf GitHub
3. Füge Logs und System-Informationen hinzu 