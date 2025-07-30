# Daytona API-Konfiguration

## Einrichtung

1. Erstellen Sie eine `.env`-Datei im Hauptverzeichnis des Projekts
2. Fügen Sie folgende Konfiguration hinzu:

```env
# Daytona Konfiguration (für Vite)
VITE_DAYTONA_API_KEY=your_api_key_here
VITE_DAYTONA_API_URL=https://api.daytona.io/v1
VITE_DAYTONA_TARGET=us
VITE_DAYTONA_ORGANIZATION_ID=your_organization_id_here

# SSL-Zertifikatsprüfung (optional)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

3. Ersetzen Sie `your_api_key_here` mit Ihrem Daytona API-Schlüssel
4. Ersetzen Sie `your_organization_id_here` mit Ihrer Daytona Organisations-ID

## API-Schlüssel und Organisations-ID erhalten

1. Besuchen Sie [Daytona Dashboard](https://app.daytona.io/dashboard)
2. Melden Sie sich an oder erstellen Sie ein neues Konto
3. Navigieren Sie zu den API-Einstellungen
4. Generieren Sie einen neuen API-Schlüssel
5. Kopieren Sie Ihre Organisations-ID aus den Organisationseinstellungen

## Fehlerbehebung

### Organisations-ID Fehler

Wenn Sie den Fehler "Organization ID is required" erhalten:
1. Stellen Sie sicher, dass Sie die korrekte Organisations-ID in der `.env`-Datei eingetragen haben
2. Die ID finden Sie in den Organisationseinstellungen im Daytona Dashboard
3. Die ID sollte im Format `org_xxxxxxxxxxxxxxxx` sein

### SSL-Zertifikatsfehler

Wenn Sie SSL-Zertifikatsfehler erhalten:

1. Stellen Sie sicher, dass Ihre Systemzertifikate aktuell sind
2. Alternativ können Sie die SSL-Verifizierung deaktivieren (nicht für Produktion empfohlen):
   ```env
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

### Umgebungsvariablen werden nicht erkannt

1. Stellen Sie sicher, dass alle Umgebungsvariablen mit `VITE_` beginnen
2. Starten Sie den Entwicklungsserver neu
3. Löschen Sie den `.vite`-Cache-Ordner und starten Sie neu

## Lokale Entwicklung

Für die lokale Entwicklung können Sie auch einen lokalen Daytona-Server verwenden:
```env
VITE_DAYTONA_API_URL=http://localhost:8080/v1
```

## Produktionsumgebung

Für die Produktionsumgebung sollten Sie die Umgebungsvariablen auf Ihrem Hosting-Service konfigurieren. Stellen Sie sicher, dass Sie:

1. SSL-Zertifikatsprüfung aktiviert lassen
2. Einen sicheren API-Schlüssel verwenden
3. Die korrekte API-URL konfigurieren
4. Die korrekte Organisations-ID verwenden 