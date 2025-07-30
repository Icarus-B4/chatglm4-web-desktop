# GLM-4.5 API Client (Rust)

Ein modularer Rust-Client für die GLM-4.5 API von Z.AI mit Unterstützung für verschiedene Modellvarianten und Streaming-Antworten.

## Features

- ✅ **Modular aufgebaut**: Separate Module für Typen, Client, Fehlerbehandlung und Streaming
- ✅ **Sichere Token-Verwaltung**: API-Token wird aus .env Datei geladen
- ✅ **Verschiedene GLM-4.5 Modelle**: `glm-4.5`, `glm-4.5-32k`, `glm-4.5-turbo`
- ✅ **Streaming-Unterstützung**: Echtzeitverarbeitung von API-Antworten
- ✅ **Thinking-Feature**: Unterstützung für GLM-4.5's Denkprozess-Feature
- ✅ **Konfigurierbar**: Alle Parameter über Umgebungsvariablen oder Code konfigurierbar
- ✅ **Robuste Fehlerbehandlung**: Umfassende Fehlertypen mit Retry-Mechanismus
- ✅ **Async/Await**: Vollständig asynchrone Implementierung
- ✅ **Windows-kompatibel**: Getestet auf Windows mit Rust 1.88.0

## Installation

1. **Voraussetzungen**:
   - Rust 1.82+ (empfohlen: neueste stabile Version)
   - Z.AI API-Schlüssel

2. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd chatglm-web
   ```

3. **Abhängigkeiten installieren**:
   ```bash
   cargo build
   ```

## Konfiguration

Erstelle eine `.env` Datei im Projektverzeichnis:

```env
# GLM-4.5 API Konfiguration
GLM_API_KEY=your-z-ai-api-key-here
GLM_API_URL=https://api.z.ai/v1
GLM_MODEL=glm-4.5
GLM_MAX_TOKENS=4096
GLM_TEMPERATURE=0.7
GLM_TOP_P=0.9
GLM_STREAM=false
GLM_THINKING_ENABLED=true

# Server Konfiguration (für Web-Server)
SERVER_HOST=127.0.0.1
SERVER_PORT=3000
```

## Verwendung

### Basis-Client-Beispiel

```rust
use chatglm_web::client::{GlmClient, GlmConfig, Message};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Konfiguration aus Umgebungsvariablen laden
    let config = GlmConfig::from_env()?;
    
    // Client erstellen
    let client = GlmClient::new(config)?;
    
    // Nachrichten definieren
    let messages = vec![
        Message::system("Du bist ein hilfsreicher AI-Assistent."),
        Message::user("Erkläre mir Quantencomputing in einfachen Worten."),
    ];
    
    // API-Aufruf ausführen
    let response = client.chat_completions(messages).await?;
    
    // Antwort verarbeiten
    if let Some(choice) = response.choices.first() {
        println!("Antwort: {}", choice.message.content);
    }
    
    Ok(())
}
```

### Streaming-Beispiel

```rust
use chatglm_web::client::{GlmClient, GlmConfig, Message};
use futures::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = GlmConfig::from_env()?.with_stream(true);
    let client = GlmClient::new(config)?;
    
    let messages = vec![
        Message::user("Schreibe eine kurze Geschichte über Roboter."),
    ];
    
    let mut stream = client.chat_completions_stream(messages).await?;
    
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result?;
        
        if let Some(choice) = chunk.choices.first() {
            if let Some(content) = &choice.delta.content {
                print!("{}", content);
            }
            
            if choice.finish_reason.is_some() {
                break;
            }
        }
    }
    
    Ok(())
}
```

### Verschiedene Modelle verwenden

```rust
use chatglm_web::client::{GlmClient, GlmConfig, GlmModel};

// Für längere Kontexte
let config = GlmConfig::from_env()?.with_model(GlmModel::Glm4532K);

// Für schnellere Antworten
let config = GlmConfig::from_env()?.with_model(GlmModel::Glm45Turbo);
```

## Test ausführen

```bash
# Test-Client ausführen (erfordert gültigen API-Schlüssel in .env)
cargo run --bin test_client

# Web-Server starten
cargo run

# Tests ausführen
cargo test
```

## API-Module

### `client::types`
- `GlmModel`: Verfügbare Modellvarianten
- `Message`: Chat-Nachrichten mit Rollen (System, User, Assistant)
- `ChatCompletionRequest/Response`: API-Request und Response-Strukturen
- `GlmConfig`: Client-Konfiguration

### `client::client`
- `GlmClient`: Haupt-API-Client
- `chat_completions()`: Synchrone API-Aufrufe
- `chat_completions_stream()`: Streaming-API-Aufrufe

### `client::error`
- `GlmError`: Umfassende Fehlertypen
- Retry-Logik für wiederholbare Fehler
- HTTP-Status-Code-Behandlung

### `client::streaming`
- `StreamingResponse`: Wrapper für Streaming-Antworten
- Server-Sent Events (SSE) Parsing
- Chunk-Aggregation und Callback-Verarbeitung

## Verfügbare GLM-4.5 Modelle

| Modell | Beschreibung | Kontext-Limit |
|--------|-------------|---------------|
| `glm-4.5` | Standard-Modell | ~128K Tokens |
| `glm-4.5-32k` | Erweiterte Kontextlänge | ~32K Tokens |
| `glm-4.5-turbo` | Optimiert für Geschwindigkeit | ~128K Tokens |

## Fehlerbehandlung

Der Client bietet umfassende Fehlerbehandlung:

```rust
match client.chat_completions(messages).await {
    Ok(response) => {
        // Erfolgreiche Antwort verarbeiten
    }
    Err(GlmError::AuthenticationError) => {
        println!("Überprüfe deinen API-Schlüssel");
    }
    Err(GlmError::RateLimitError { message }) => {
        println!("Rate Limit erreicht: {}", message);
        // Automatisches Retry nach delay_time möglich
    }
    Err(e) if e.is_retryable() => {
        if let Some(delay) = e.retry_delay() {
            tokio::time::sleep(delay).await;
            // Retry-Logik implementieren
        }
    }
    Err(e) => {
        println!("Fehler: {}", e);
    }
}
```

## Konfigurationsoptionen

| Variable | Beschreibung | Standard |
|----------|-------------|----------|
| `GLM_API_KEY` | Z.AI API-Schlüssel | *erforderlich* |
| `GLM_API_URL` | API Base URL | `https://api.z.ai/v1` |
| `GLM_MODEL` | Zu verwendendes Modell | `glm-4.5` |
| `GLM_MAX_TOKENS` | Maximale Token-Anzahl | `4096` |
| `GLM_TEMPERATURE` | Kreativitäts-Parameter | `0.7` |
| `GLM_TOP_P` | Nucleus Sampling | `0.9` |
| `GLM_STREAM` | Streaming aktivieren | `false` |
| `GLM_THINKING_ENABLED` | Thinking-Feature | `true` |

## Beispiel-Projektstruktur

```
src/
├── client/
│   ├── mod.rs          # Modul-Exports
│   ├── types.rs        # API-Typen und Strukturen
│   ├── client.rs       # Haupt-Client-Implementierung
│   ├── error.rs        # Fehlerbehandlung
│   └── streaming.rs    # Streaming-Funktionalität
├── config/
│   └── mod.rs          # Konfiguration (für Web-Server)
├── bin/
│   └── test_client.rs  # Test-Anwendung
├── lib.rs              # Library-Root
└── main.rs             # Web-Server (Axum)
```

## Entwicklung

### Kompilierung prüfen
```bash
cargo check
```

### Build (Release)
```bash
cargo build --release
```

### Code-Formatierung
```bash
cargo fmt
```

### Linting
```bash
cargo clippy
```

## Lizenz

[Hier Lizenz einfügen]

## Mitwirkende

[Hier Mitwirkende auflisten]

---

**Hinweis**: Stelle sicher, dass du über einen gültigen Z.AI API-Schlüssel verfügst, bevor du den Client verwendest. Der Client ist für Windows optimiert und wurde mit Rust 1.88.0 getestet.
