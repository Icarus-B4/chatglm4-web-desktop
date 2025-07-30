use axum::{response::Html, routing::get, Router};
use dotenv::dotenv;
use std::{env, sync::Arc};
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};
use tracing::{info, warn};

mod config;
mod client;
mod api;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Lade Umgebungsvariablen
    if let Err(_) = dotenv() {
        warn!("Keine .env Datei gefunden, verwende Systemumgebungsvariablen.");
    }

    // Initialisiere Logging
    tracing_subscriber::fmt::init();

    // Lade Konfiguration
    let config = config::AppConfig::new()
        .map_err(|e| anyhow::anyhow!("Konfigurationsfehler: {}", e))?;

    info!("ChatGLM Web-Anwendung startet...");
    info!("Server läuft auf {}:{}", config.server.host, config.server.port);

    // Erstelle GLM-Client
    let glm_config = client::GlmConfig {
        api_key: config.chatglm.api_key.clone(),
        api_url: config.chatglm.api_url.clone(),
        model: match config.chatglm.model.as_str() {
            "glm-4.5" => client::GlmModel::Glm45,
            "glm-4.5-32k" => client::GlmModel::Glm4532K,
            "glm-4.5-turbo" => client::GlmModel::Glm45Turbo,
            _ => client::GlmModel::Glm45,
        },
        max_tokens: config.chatglm.max_tokens,
        temperature: config.chatglm.temperature,
        top_p: config.chatglm.top_p,
        stream: config.chatglm.stream,
        thinking_enabled: true,
        timeout: std::time::Duration::from_secs(config.server.timeout),
    };
    
    let glm_client = client::GlmClient::new(glm_config)
        .map_err(|e| anyhow::anyhow!("GLM-Client-Fehler: {}", e))?;

    // CORS-Layer konfigurieren
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers(Any)
        .allow_methods(Any);

    // Erstelle Axum Router mit allen API-Endpunkten
    let app = Router::new()
        .route("/", get(hello_handler))
        .route("/api/health", get(health_handler))
        // Chat-API
        .merge(create_chat_routes(glm_client.clone()))
        // Settings-API
        .merge(api::settings_routes())
        // Models-API
        .merge(api::models_routes())
        // Functions-API (temporär deaktiviert)
        // .merge(api::functions_routes())
        // WebSocket
        .merge(api::websocket_route(Arc::new(glm_client)))
        .layer(cors);

    // Starte Server
    let listener = TcpListener::bind(format!("{}:{}", config.server.host, config.server.port))
        .await?;

    info!("Server gestartet auf http://{}:{}", config.server.host, config.server.port);
    
    axum::serve(listener, app).await?;

    Ok(())
}

async fn hello_handler() -> Html<&'static str> {
    Html(r#"
    <!DOCTYPE html>
    <html>
    <head>
        <title>ChatGLM Web</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>ChatGLM Web-Anwendung</h1>
        <p>Willkommen zur ChatGLM Web-Anwendung!</p>
        <p>Die API ist bereit und läuft.</p>
    </body>
    </html>
    "#)
}

async fn health_handler() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "chatglm-web",
        "version": "0.1.0"
    }))
}

fn create_chat_routes(client: client::GlmClient) -> Router {
    api::chat_routes(client)
}
