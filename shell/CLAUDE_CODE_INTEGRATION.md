# 🤖 Claude Code Integration (Browser-kompatibel)

Das ChatGLM Web System wurde um **Claude Code-ähnliche** Funktionalität erweitert für professionelle Code-Generierung!

## 🚀 Verwendung

### Automatische Claude Code Aktivierung

Das System erkennt automatisch, wenn komplexe Code-Generierung benötigt wird:

**Trigger-Wörter:**
- `"claude"` - Explizite Claude Code Verwendung
- `"erstelle"` - Projekt erstellen
- `"entwickle"` - Entwicklungsaufgaben  
- `"baue"` - Build-Aufgaben
- `"programmiere"` - Programmieraufgaben

### Beispiel-Prompts

```
✅ "Erstelle eine React App mit TypeScript"
✅ "Entwickle eine Next.js E-Commerce Seite"  
✅ "Baue eine Node.js API mit Express"
✅ "Programmiere ein Vue.js Dashboard"
✅ "Claude, erstelle eine Landing Page"
```

## 🔧 System-Flow

1. **User schreibt Prompt** mit Trigger-Wort
2. **Browser-kompatible Claude Code Simulation** aktiviert sich
3. **Intelligente Projekterkennung:**
   - Next.js für "next" oder "nextjs"
   - React für "react"  
   - Vue für "vue"
   - Node.js für "node" oder "express"
   - Vanilla HTML/CSS/JS als Fallback
4. **Vollständige Projekte** werden generiert
5. **Code-Artefakte** automatisch extrahiert
6. **"In isolierter Umgebung öffnen"** verfügbar

## 📦 Features

### Claude Code Vorteile
- **Intelligente Projektstruktur** - Automatische Ordner-Organisation
- **Dependency Management** - Korrekte package.json Generierung
- **Best Practices** - Moderne Code-Standards
- **Cross-Platform** - Funktioniert überall
- **Multi-Turn** - Bis zu 10 Iterationen für komplexe Builds

### Integration mit Daytona
- **Automatischer Upload** aller generierten Dateien
- **npm install** für Node.js Projekte
- **Dev-Server Start** mit `npm run dev`
- **Live-Preview** in isolierter Umgebung

## 🎯 Fallback-System

Wenn Claude Code nicht verfügbar:
1. **Demo-System** aktiviert sich
2. **Next.js Landing Page** als Fallback
3. **GLM-4 API** als letzte Option

## 🔧 Konfiguration

### Environment Variables
```env
# Für Claude Code SDK (falls API-Key benötigt)
ANTHROPIC_API_KEY=your-key-here

# Für Daytona Integration
DAYTONA_API_KEY=your-daytona-key
DAYTONA_API_URL=https://api.daytona.io
```

### Anpassung der Tools
In `src/services/claudeCodeService.ts`:

```typescript
allowedTools: [
  "Read", "Write", "Edit", "MultiEdit",
  "Bash", "LS", "Glob", "Grep", 
  "WebSearch", "WebFetch"
]
```

## 🎉 Ergebnis

Das System generiert automatisch:
- **Vollständige Projekte** mit allen Dateien
- **Korrekte Dependencies** in package.json
- **Moderne Code-Struktur** mit TypeScript
- **Sofortige Ausführung** in Daytona-Sandbox

**→ Von Prompt zu laufender App in wenigen Sekunden!** 🚀

Das ChatGLM Web System wurde um **Claude Code-ähnliche** Funktionalität erweitert für professionelle Code-Generierung!

## 🚀 Verwendung

### Automatische Claude Code Aktivierung

Das System erkennt automatisch, wenn komplexe Code-Generierung benötigt wird:

**Trigger-Wörter:**
- `"claude"` - Explizite Claude Code Verwendung
- `"erstelle"` - Projekt erstellen
- `"entwickle"` - Entwicklungsaufgaben  
- `"baue"` - Build-Aufgaben
- `"programmiere"` - Programmieraufgaben

### Beispiel-Prompts

```
✅ "Erstelle eine React App mit TypeScript"
✅ "Entwickle eine Next.js E-Commerce Seite"  
✅ "Baue eine Node.js API mit Express"
✅ "Programmiere ein Vue.js Dashboard"
✅ "Claude, erstelle eine Landing Page"
```

## 🔧 System-Flow

1. **User schreibt Prompt** mit Trigger-Wort
2. **Browser-kompatible Claude Code Simulation** aktiviert sich
3. **Intelligente Projekterkennung:**
   - Next.js für "next" oder "nextjs"
   - React für "react"  
   - Vue für "vue"
   - Node.js für "node" oder "express"
   - Vanilla HTML/CSS/JS als Fallback
4. **Vollständige Projekte** werden generiert
5. **Code-Artefakte** automatisch extrahiert
6. **"In isolierter Umgebung öffnen"** verfügbar

## 📦 Features

### Claude Code Vorteile
- **Intelligente Projektstruktur** - Automatische Ordner-Organisation
- **Dependency Management** - Korrekte package.json Generierung
- **Best Practices** - Moderne Code-Standards
- **Cross-Platform** - Funktioniert überall
- **Multi-Turn** - Bis zu 10 Iterationen für komplexe Builds

### Integration mit Daytona
- **Automatischer Upload** aller generierten Dateien
- **npm install** für Node.js Projekte
- **Dev-Server Start** mit `npm run dev`
- **Live-Preview** in isolierter Umgebung

## 🎯 Fallback-System

Wenn Claude Code nicht verfügbar:
1. **Demo-System** aktiviert sich
2. **Next.js Landing Page** als Fallback
3. **GLM-4 API** als letzte Option

## 🔧 Konfiguration

### Environment Variables
```env
# Für Claude Code SDK (falls API-Key benötigt)
ANTHROPIC_API_KEY=your-key-here

# Für Daytona Integration
DAYTONA_API_KEY=your-daytona-key
DAYTONA_API_URL=https://api.daytona.io
```

### Anpassung der Tools
In `src/services/claudeCodeService.ts`:

```typescript
allowedTools: [
  "Read", "Write", "Edit", "MultiEdit",
  "Bash", "LS", "Glob", "Grep", 
  "WebSearch", "WebFetch"
]
```

## 🎉 Ergebnis

Das System generiert automatisch:
- **Vollständige Projekte** mit allen Dateien
- **Korrekte Dependencies** in package.json
- **Moderne Code-Struktur** mit TypeScript
- **Sofortige Ausführung** in Daytona-Sandbox

**→ Von Prompt zu laufender App in wenigen Sekunden!** 🚀