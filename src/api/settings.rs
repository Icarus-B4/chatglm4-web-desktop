use axum::{response::IntoResponse, routing::{get, post, put}, Json, Router, extract::State};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatSettings {
    pub model: String,
    pub temperature: f32,
    pub top_p: f32,
    pub max_tokens: u32,
    pub thinking_enabled: bool,
    pub stream: bool,
}

impl Default for ChatSettings {
    fn default() -> Self {
        Self {
            model: "glm-4.5".to_string(),
            temperature: 0.7,
            top_p: 0.7,
            max_tokens: 8192,
            thinking_enabled: true,
            stream: true,
        }
    }
}

pub type SettingsState = Arc<RwLock<ChatSettings>>;

pub fn settings_routes() -> Router {
    let settings = Arc::new(RwLock::new(ChatSettings::default()));
    
    Router::new()
        .route("/api/settings", get(get_settings))
        .route("/api/settings", put(update_settings))
        .route("/api/settings/reset", post(reset_settings))
        .with_state(settings)
}

async fn get_settings(State(settings): State<SettingsState>) -> impl IntoResponse {
    let settings = settings.read().await;
    Json(json!({
        "settings": *settings,
        "status": "success"
    }))
}

async fn update_settings(
    State(settings): State<SettingsState>,
    Json(payload): Json<ChatSettings>
) -> impl IntoResponse {
    let mut settings_guard = settings.write().await;
    *settings_guard = payload.clone();
    
    Json(json!({
        "settings": payload,
        "status": "updated",
        "message": "Einstellungen erfolgreich aktualisiert"
    }))
}

async fn reset_settings(State(settings): State<SettingsState>) -> impl IntoResponse {
    let mut settings_guard = settings.write().await;
    *settings_guard = ChatSettings::default();
    
    Json(json!({
        "settings": *settings_guard,
        "status": "reset",
        "message": "Einstellungen auf Standard zurückgesetzt"
    }))
}

// Hilfsfunktionen für Validierung
impl ChatSettings {
    pub fn validate(&self) -> Result<(), String> {
        if self.temperature < 0.0 || self.temperature > 1.0 {
            return Err("Temperature muss zwischen 0.0 und 1.0 liegen".to_string());
        }
        
        if self.top_p < 0.0 || self.top_p > 1.0 {
            return Err("top_p muss zwischen 0.0 und 1.0 liegen".to_string());
        }
        
        if self.max_tokens == 0 || self.max_tokens > 32768 {
            return Err("max_tokens muss zwischen 1 und 32768 liegen".to_string());
        }
        
        let valid_models = vec!["glm-4.5", "glm-4.5-32k", "glm-4.5-turbo"];
        if !valid_models.contains(&self.model.as_str()) {
            return Err(format!("Ungültiges Modell. Verfügbare Modelle: {}", valid_models.join(", ")));
        }
        
        Ok(())
    }
}
