# Web-Search Service

Dieser Service ermöglicht Web-Suchen innerhalb der ChatGLM Web Anwendung.

## 🚀 Automatischer Start

Der Web-Search Service wird automatisch mit der Hauptanwendung gestartet:

### Windows (Batch)
```bash
start-app.bat
```

### Windows (PowerShell)
```powershell
.\start-app.ps1
```

## 🔧 Manueller Start

Falls du den Service manuell starten möchtest:

### Einfacher Start
```bash
start-web-search.bat
```

### Als Windows Service (empfohlen für Produktivumgebung)
```bash
install-as-service.bat
```

## 📋 Voraussetzungen

- Node.js (Version 16 oder höher)
- npm
- Internetverbindung (für Web-Suchen)

## 🔍 Funktionalität

Der Service bietet folgende Funktionen:

- **Web-Suche**: Sucht nach Informationen im Internet
- **Sicherheit**: Rate Limiting und CORS-Schutz
- **Performance**: Optimiert für schnelle Antworten

## 🌐 API Endpoints

### POST /search
Führt eine Web-Suche durch.

**Request:**
```json
{
  "query": "deine Suchanfrage"
}
```

**Response:**
```json
[
  {
    "title": "Titel der Seite",
    "url": "https://example.com",
    "snippet": "Kurze Beschreibung..."
  }
]
```

## ⚙️ Konfiguration

Der Service läuft standardmäßig auf Port 3003. Du kannst den Port über die Umgebungsvariable `PORT` ändern:

```bash
set PORT=3002
npm start
```

## 🐛 Troubleshooting

### Service startet nicht
1. Prüfe ob Node.js installiert ist: `node --version`
2. Installiere Dependencies: `npm install`
3. Installiere Playwright Browser: `npx playwright install`

### Web-Suche funktioniert nicht
1. Stelle sicher, dass der Service auf http://localhost:3003 läuft
2. Prüfe die Firewall-Einstellungen
3. Schau in die Logs für Fehlermeldungen

### Performance-Probleme
- Der Service verwendet Playwright für Web-Scraping
- Erste Anfragen können langsamer sein (Browser-Start)
- Rate Limiting ist aktiviert (100 Anfragen pro 15 Minuten)

## 📝 Logs

Logs werden in der Konsole ausgegeben. Bei Verwendung von PM2:

```bash
pm2 logs web-search-service
```

## 🔄 Neustart

### Manueller Neustart
```bash
npm start
```

### Mit PM2
```bash
pm2 restart web-search-service
```

## 🛑 Beenden

### Manueller Stop
Drücke `Ctrl+C` im Service-Fenster

### Mit PM2
```bash
pm2 stop web-search-service
```

## 📞 Support

Bei Problemen:
1. Prüfe die Logs
2. Stelle sicher, dass alle Dependencies installiert sind
3. Teste die Internetverbindung
4. Prüfe Firewall-Einstellungen 