# 🚀 Daytona Integration Setup

## Problem: Leere Sandbox-Liste

Wenn dein Daytona Dashboard leer ist, liegt das meist an der Konfiguration. Hier ist die Schritt-für-Schritt-Lösung:

## 🔧 1. API-Key überprüfen

### Aktuelle Konfiguration:
```typescript
// src/config/daytona.ts
API_KEY: 'dtn_1ccfd7ced16d9e8bc7a71965429ce9d612b9a3673c997da1bb2b702e39e14050'
API_URL: 'https://api.daytona.io/v1'
```

### Überprüfe deinen API-Key:
1. Gehe zu: https://app.daytona.io/dashboard/settings
2. Kopiere deinen **Personal Access Token**
3. Ersetze den Key in `src/config/daytona.ts`

## 🧪 2. Verbindung testen

1. **Öffne ChatGLM Web**
2. **Erstelle Code** (z.B. "Erstelle eine React App")
3. **Klicke "In isolierter Umgebung öffnen"**
4. **Klicke "Test Connection"** Button
5. **Schaue in Browser Console** für detaillierte Logs

## 🐛 3. Debug-Informationen

### Browser Console checken:
```javascript
// Öffne Browser Developer Tools (F12)
// Gehe zu Console Tab
// Suche nach:
"🧪 Testing Daytona connection..."
"✅ Connection successful!" oder "❌ Daytona connection failed:"
```

### Häufige Fehler:

**401 Unauthorized:**
- API-Key ist falsch oder abgelaufen
- Erstelle neuen Token in Daytona Dashboard

**403 Forbidden:**
- Account hat keine Berechtigung für Sandbox-Erstellung
- Überprüfe dein Daytona-Abo

**Network Error:**
- Internet-Verbindung prüfen
- Firewall/Proxy-Einstellungen

## 🔄 4. Fallback-System

Das System hat ein **automatisches Fallback**:

1. **Erst:** Echte Daytona-Sandbox versuchen
2. **Bei Fehler:** Lokale Simulation aktivieren
3. **Weiterhin funktional** für Code-Vorschau

### Fallback-Erkennung:
```
Logs zeigen:
"❌ Sandbox-Erstellung fehlgeschlagen"
"🔄 Fallback zu lokaler Simulation..."
```

## ✅ 5. Erfolgreiche Verbindung

Wenn alles funktioniert:
```
✅ Sandbox erstellt
📁 Dateien hochgeladen  
⚙️ npm install läuft
🚀 Dev-Server gestartet
🌐 Live-URL verfügbar
```

## 🛠️ 6. Alternative Lösungen

### Option A: Daytona CLI verwenden
```bash
# Installiere Daytona CLI
curl -sSf https://get.daytona.io | sh

# Authentifizierung
daytona auth login

# Test
daytona list
```

### Option B: Environment Variables
```bash
# In deiner .env Datei:
DAYTONA_API_KEY=dtn_your_real_key_here
DAYTONA_API_URL=https://api.daytona.io/v1
```

### Option C: Lokale Entwicklung
Für reine lokale Tests kannst du das Fallback-System verwenden:
- Funktioniert ohne Internet
- Simuliert alle Daytona-Features
- Perfekt für Entwicklung

## 📞 Support

Wenn das Problem weiterhin besteht:
1. **Browser Console Screenshot** machen
2. **Daytona Dashboard URL** teilen  
3. **API-Key Status** überprüfen (ohne den Key zu zeigen)
4. **Error-Logs** aus der Konsole kopieren

## Problem: Leere Sandbox-Liste

Wenn dein Daytona Dashboard leer ist, liegt das meist an der Konfiguration. Hier ist die Schritt-für-Schritt-Lösung:

## 🔧 1. API-Key überprüfen

### Aktuelle Konfiguration:
```typescript
// src/config/daytona.ts
API_KEY: 'dtn_1ccfd7ced16d9e8bc7a71965429ce9d612b9a3673c997da1bb2b702e39e14050'
API_URL: 'https://api.daytona.io/v1'
```

### Überprüfe deinen API-Key:
1. Gehe zu: https://app.daytona.io/dashboard/settings
2. Kopiere deinen **Personal Access Token**
3. Ersetze den Key in `src/config/daytona.ts`

## 🧪 2. Verbindung testen

1. **Öffne ChatGLM Web**
2. **Erstelle Code** (z.B. "Erstelle eine React App")
3. **Klicke "In isolierter Umgebung öffnen"**
4. **Klicke "Test Connection"** Button
5. **Schaue in Browser Console** für detaillierte Logs

## 🐛 3. Debug-Informationen

### Browser Console checken:
```javascript
// Öffne Browser Developer Tools (F12)
// Gehe zu Console Tab
// Suche nach:
"🧪 Testing Daytona connection..."
"✅ Connection successful!" oder "❌ Daytona connection failed:"
```

### Häufige Fehler:

**401 Unauthorized:**
- API-Key ist falsch oder abgelaufen
- Erstelle neuen Token in Daytona Dashboard

**403 Forbidden:**
- Account hat keine Berechtigung für Sandbox-Erstellung
- Überprüfe dein Daytona-Abo

**Network Error:**
- Internet-Verbindung prüfen
- Firewall/Proxy-Einstellungen

## 🔄 4. Fallback-System

Das System hat ein **automatisches Fallback**:

1. **Erst:** Echte Daytona-Sandbox versuchen
2. **Bei Fehler:** Lokale Simulation aktivieren
3. **Weiterhin funktional** für Code-Vorschau

### Fallback-Erkennung:
```
Logs zeigen:
"❌ Sandbox-Erstellung fehlgeschlagen"
"🔄 Fallback zu lokaler Simulation..."
```

## ✅ 5. Erfolgreiche Verbindung

Wenn alles funktioniert:
```
✅ Sandbox erstellt
📁 Dateien hochgeladen  
⚙️ npm install läuft
🚀 Dev-Server gestartet
🌐 Live-URL verfügbar
```

## 🛠️ 6. Alternative Lösungen

### Option A: Daytona CLI verwenden
```bash
# Installiere Daytona CLI
curl -sSf https://get.daytona.io | sh

# Authentifizierung
daytona auth login

# Test
daytona list
```

### Option B: Environment Variables
```bash
# In deiner .env Datei:
DAYTONA_API_KEY=dtn_your_real_key_here
DAYTONA_API_URL=https://api.daytona.io/v1
```

### Option C: Lokale Entwicklung
Für reine lokale Tests kannst du das Fallback-System verwenden:
- Funktioniert ohne Internet
- Simuliert alle Daytona-Features
- Perfekt für Entwicklung

## 📞 Support

Wenn das Problem weiterhin besteht:
1. **Browser Console Screenshot** machen
2. **Daytona Dashboard URL** teilen  
3. **API-Key Status** überprüfen (ohne den Key zu zeigen)
4. **Error-Logs** aus der Konsole kopieren