# ChatGLM Web - Frontend

Ein modernes Chat-Interface mit React, TypeScript und ShadCN-UI, das das Design von chat.z.ai repliziert.

## ✨ Features

- **Modernes Design**: Inspiriert von chat.z.ai mit cleanem, minimalistischem Interface
- **Dark/Light Mode**: Vollständig unterstützter Themenwechsel mit System-Präferenz Detection
- **Streaming-Support**: Echtzeit-Streaming von Chat-Antworten über WebSocket
- **Responsive Design**: Funktioniert perfekt auf Desktop, Tablet und Mobile
- **TypeScript**: Vollständige Typsicherheit
- **ShadCN-UI**: Moderne, accessible UI-Komponenten
- **Tailwind CSS**: Utility-first CSS Framework für schnelle Entwicklung

## 🛠 Technologie-Stack

### Frontend-Technologie: **React mit TypeScript**

**Warum React?**
- Bewährt und stabil für komplexe Chat-Interfaces
- Excellent TypeScript-Integration
- Große Entwickler-Community und Ökosystem
- Perfect für Real-time Streaming Applications

**Alternative Technologien betrachtet:**
- **Leptos (Rust)**: Zu neu, weniger Chat-spezifische Libraries
- **Yew (Rust)**: Komplexer für WebSocket-Streaming
- **Tauri**: Überdimensioniert für Web-Chat-Interface
- **Vanilla JS**: Zu komplex für moderne Chat-Features

### Core Dependencies

```json
{
  \"react\": \"^18.2.0\",
  \"typescript\": \"^5.3.0\",
  \"vite\": \"^5.0.0\",
  \"tailwindcss\": \"^3.3.6\",
  \"@radix-ui/*\": \"Accessible UI Komponenten\",
  \"lucide-react\": \"^0.294.0\",
  \"clsx\": \"^2.0.0\",
  \"tailwind-merge\": \"^2.2.0\"
}
```

## 🎨 Design-Features

### Z.ai-inspiriertes Interface
- **Clean Layout**: Minimalistisch mit Fokus auf Conversation
- **Sidebar Navigation**: Ausklappbare Chat-Historie
- **Message Bubbles**: Unterschiedliche Styles für User/Assistant
- **Streaming Indicators**: Live-Typing Animation
- **Avatar System**: User- und Bot-Icons

### Responsive Verhalten
- **Mobile-First**: Funktioniert perfekt auf allen Bildschirmgrößen
- **Touch-Optimiert**: Große Touch-Targets, Swipe-Gestures
- **Adaptive Sidebar**: Collapsible auf Mobile, persistent auf Desktop

### Dark/Light Mode
- **System Detection**: Automatische Erkennung der System-Präferenz
- **Manual Toggle**: Sun/Moon Icon für manuellen Wechsel
- **Smooth Transitions**: Sanfte Übergänge zwischen Modi
- **Persistent Storage**: Theme-Wahl wird gespeichert

## 🔄 Chat-Features

### Streaming-Responses
```typescript
// WebSocket-basiertes Streaming
const { isConnected, sendMessage } = useWebSocket({
  url: 'ws://localhost:8080/ws',
  onMessage: handleStreamingMessage,
});

// Fallback auf HTTP Server-Sent Events
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message }),
}).then(response => {
  const reader = response.body?.getReader();
  // Stream processing...
});
```

### Message Management
- **Real-time Updates**: Live-Aktualisierung während Streaming
- **Auto-Scroll**: Automatisches Scrollen zu neuen Nachrichten
- **Message History**: Persistente Chat-Verläufe
- **Error Handling**: Graceful Degradation bei Verbindungsproblemen

## 🚀 Setup & Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Startet auf http://localhost:3000
```

### Build für Produktion
```bash
npm run build
# Output in ./static/ für Rust-Backend Integration
```

### Projekt-Struktur
```
src/
├── components/          # React Komponenten
│   ├── ChatInterface.tsx    # Haupt-Chat-Interface
│   ├── MessageBubble.tsx    # Einzelne Nachrichten
│   ├── Sidebar.tsx          # Chat-Historie Sidebar
│   ├── ThemeToggle.tsx      # Dark/Light Mode Toggle
│   └── TypingIndicator.tsx  # Streaming-Indikator
├── hooks/               # Custom React Hooks
│   ├── useChatMessages.ts   # Chat State Management
│   └── useWebSocket.ts      # WebSocket Connection
├── lib/                 # Utility Functions
│   └── utils.ts             # Helper Functions
├── styles/              # CSS & Styling
│   └── globals.css          # Global Styles & CSS Variables
├── types/               # TypeScript Definitionen
│   └── chat.ts              # Chat-spezifische Types
└── main.tsx            # React Entry Point
```

## 🔧 Integration mit Rust Backend

### API Endpoints
- `POST /api/chat` - HTTP Chat Endpoint (Fallback)
- `WS /ws` - WebSocket für Streaming Chat

### Proxy Konfiguration (vite.config.ts)
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080',
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
    },
  },
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
.message-bubble {
  @apply max-w-[90%] px-2;
}

/* Tablet */
@media (min-width: 768px) {
  .message-bubble {
    @apply max-w-[75%] px-4;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .message-bubble {
    @apply max-w-[60%];
  }
}
```

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy Loading von Komponenten
- **WebSocket Reconnection**: Automatische Wiederverbindung
- **Debounced Input**: Optimierte Eingabe-Behandlung
- **Virtual Scrolling**: Für große Chat-Verläufe (geplant)
- **Image Lazy Loading**: Für Chat-Medien (geplant)

## 🔜 Geplante Features

- [ ] Chat-Session Persistierung
- [ ] Markdown-Rendering für Bot-Antworten
- [ ] File Upload Support
- [ ] Voice Message Integration
- [ ] Multi-Language Support
- [ ] Keyboard Shortcuts
- [ ] Chat Export Funktionalität

## 🌟 Design-Inspiration

Das Interface orientiert sich stark an **chat.z.ai** mit:
- Clean, minimalistisches Design
- Fokus auf Lesbarkeit und UX
- Moderne Typografie (System Font Stack)
- Sanfte Animationen und Transitions
- Accessible Color Palette für Dark/Light Mode

## Isolierte Entwicklungsumgebung

Die ChatGLM Web-Anwendung verfügt über eine isolierte Entwicklungsumgebung für die sichere Ausführung von generiertem Code. Diese Umgebung bietet folgende Funktionen:

### Features

- **Sichere Code-Ausführung**: Code wird in einer isolierten Sandbox ausgeführt, um die Hauptanwendung zu schützen
- **Dev-Server-Management**: Automatisches Starten und Verwalten von Dev-Servern für generierte Projekte
- **Projektstruktur-Management**: Generierung einer vollständigen Projektstruktur mit package.json, README und anderen notwendigen Dateien
- **Framework-Erkennung**: Automatische Erkennung des verwendeten Frameworks (React, Vue, Angular oder Vanilla JS)
- **Live-Vorschau**: Echtzeit-Vorschau des generierten Codes
- **Server-Logs**: Anzeige von Server-Logs für Debugging-Zwecke

### Komponenten

Die isolierte Umgebung besteht aus folgenden Hauptkomponenten:

1. **IsolatedDevEnvironment**: Hauptkomponente für die isolierte Umgebung
2. **DevServerManager**: Hook für die Verwaltung des Dev-Servers
3. **CodeSandbox**: Komponente für die sichere Ausführung von Code
4. **ProjectManager**: Komponente für die Verwaltung der Projektstruktur

### Verwendung

Wenn ein Benutzer Code generiert, kann er diesen in der isolierten Umgebung öffnen, indem er auf den Button "In isolierter Umgebung öffnen" klickt. Die Umgebung startet automatisch einen Dev-Server und zeigt eine Vorschau des Codes an.

### Sicherheitsaspekte

Die isolierte Umgebung verwendet mehrere Sicherheitsmechanismen:

- **Sandbox-Attribute**: Strenge iframe-Sandbox-Attribute zur Einschränkung von Berechtigungen
- **Content Security Policy**: CSP-Header zur Verhinderung von XSS-Angriffen
- **Fehlerbehandlung**: Robuste Fehlerbehandlung, um die Hauptanwendung vor Abstürzen zu schützen

### Zukünftige Erweiterungen

- Integration mit Backend-Services für persistente Projekte
- Unterstützung für komplexere Projektstrukturen
- Erweitertes Dependency-Management
- Exportieren von Projekten als ZIP-Dateien
