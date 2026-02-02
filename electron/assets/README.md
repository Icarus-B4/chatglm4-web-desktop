# ChatGLM Web Icons

Dieses Verzeichnis enthält die Icons für die Electron Desktop App.

## 🎨 Icon-Design

Das Icon zeigt:
- **Hintergrund**: Gradient von Blau zu Lila (modern, AI-typisch)
- **Chat-Bubbles**: Weiße und blaue Sprechblasen für Chat-Funktionalität
- **Chat-Linien**: Simulierte Nachrichten für dynamisches Aussehen
- **Glow-Effekt**: Moderne Schatten und Glow-Effekte

## 📁 Dateien

- `icon.svg` - Haupt-SVG-Icon (512x512)
- `icon-simple.svg` - Vereinfachte Version für kleine Größen
- `icon.png` - Haupt-PNG-Icon (512x512)
- `icon-16x16.png` - Kleine Größe für Taskbar
- `icon-32x32.png` - Standard-Größe
- `icon-48x48.png` - Desktop-Icon
- `icon-64x64.png` - Erweiterte Desktop-Größe
- `icon-128x128.png` - Große Desktop-Größe
- `icon-256x256.png` - High-DPI Desktop
- `icon-512x512.png` - Maximale Größe

## 🔧 Icon aktualisieren

### 1. SVG generieren
```bash
node scripts/generate-icons.js
```

### 2. PNG konvertieren
**Option A: Online-Konverter**
- Gehe zu https://convertio.co/svg-png/
- Lade `icon.svg` hoch
- Konvertiere zu PNG 512x512
- Speichere als `icon.png`

**Option B: Node.js**
```bash
npm install -g svgexport
svgexport electron/assets/icon.svg electron/assets/icon.png 512:512
```

**Option C: Inkscape**
```bash
inkscape electron/assets/icon.svg --export-filename=electron/assets/icon.png --export-width=512 --export-height=512
```

### 3. Verschiedene Größen erstellen
Erstelle alle benötigten Größen:
- 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512

### 4. App neu bauen
```bash
npm run electron:build
```

## 🎯 Icon-Spezifikationen

- **Format**: PNG mit Transparenz
- **Hauptgröße**: 512x512 Pixel
- **Farben**: Blau-Lila Gradient (#667eea → #764ba2 → #f093fb)
- **Stil**: Modern, minimalistisch, AI-typisch
- **Erkennbarkeit**: Chat-Bubbles für sofortige Erkennung

## 📱 Plattform-spezifische Icons

### Windows
- `icon.ico` - ICO-Datei für Windows
- `icon-16x16.png` bis `icon-256x256.png`

### macOS
- `icon.icns` - ICNS-Datei für macOS
- `icon-16x16.png` bis `icon-512x512.png`

### Linux
- `icon.png` - PNG-Datei für Linux
- `icon-16x16.png` bis `icon-512x512.png` 