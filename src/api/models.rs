use axum::{response::IntoResponse, routing::get, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub max_tokens: u32,
    pub supports_streaming: bool,
    pub supports_thinking: bool,
    pub context_window: u32,
}

impl ModelInfo {
    pub fn glm_4_5() -> Self {
        Self {
            id: "glm-4.5".to_string(),
            name: "GLM-4.5".to_string(),
            description: "Neuestes GLM-4.5 Modell mit verbesserter Leistung".to_string(),
            max_tokens: 8192,
            supports_streaming: true,
            supports_thinking: true,
            context_window: 128000,
        }
    }

    pub fn glm_4_5_32k() -> Self {
        Self {
            id: "glm-4.5-32k".to_string(),
            name: "GLM-4.5-32K".to_string(),
            description: "GLM-4.5 mit erweiterten 32K Token-Support".to_string(),
            max_tokens: 32768,
            supports_streaming: true,
            supports_thinking: true,
            context_window: 128000,
        }
    }

    pub fn glm_4_5_turbo() -> Self {
        Self {
            id: "glm-4.5-turbo".to_string(),
            name: "GLM-4.5-Turbo".to_string(),
            description: "Schnellere Variante von GLM-4.5 für bessere Performance".to_string(),
            max_tokens: 8192,
            supports_streaming: true,
            supports_thinking: false,
            context_window: 128000,
        }
    }
}

pub fn models_routes() -> Router {
    Router::new()
        .route("/api/models", get(list_models))
        .route("/api/models/capabilities", get(model_capabilities))
}

async fn list_models() -> impl IntoResponse {
    let models = vec![
        ModelInfo::glm_4_5(),
        ModelInfo::glm_4_5_32k(),
        ModelInfo::glm_4_5_turbo(),
    ];

    Json(json!({
        "models": models,
        "count": models.len(),
        "status": "success"
    }))
}

async fn model_capabilities() -> impl IntoResponse {
    let capabilities = json!({
        "supported_features": [
            "streaming",
            "thinking_mode",
            "function_calling",
            "system_prompts",
            "multi_turn_conversation"
        ],
        "max_context_length": 128000,
        "supported_languages": [
            "deutsch",
            "englisch",
            "chinesisch",
            "französisch",
            "spanisch",
            "japanisch"
        ],
        "pricing_tier": "standard"
    });

    Json(json!({
        "capabilities": capabilities,
        "status": "success"
    }))
}
