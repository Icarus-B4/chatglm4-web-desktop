use axum::{response::IntoResponse, routing::post, Json, Router, extract::State};
use serde_json::{json, Value};
use futures::StreamExt;
use crate::client::{GlmClient, Message};
use std::sync::Arc;

pub fn chat_routes(client: GlmClient) -> Router {
    Router::new()
        .route("/api/chat", post(chat_handler))
        .route("/api/chat/stream", post(chat_stream_handler))
        .with_state(Arc::new(client))
}

async fn chat_handler(
    State(client): State<Arc<GlmClient>>,
    Json(payload): Json<Value>
) -> impl IntoResponse {
    // Extrahiere Nachrichten
    let messages: Vec<Message> = match serde_json::from_value(payload["messages"].clone()) {
        Ok(messages) => messages,
        Err(_) => return Json(json!({"error": "Ungültige Nachrichtendaten"})).into_response(),
    };

    // Sende Anfrage an GLM-Client
    match client.chat_completions(messages).await {
        Ok(res) => Json(json!({"response": res})).into_response(),
        Err(err) => Json(json!({"error": err.to_string()})).into_response(),
    }
}

async fn chat_stream_handler(
    State(client): State<Arc<GlmClient>>,
    Json(payload): Json<Value>
) -> impl IntoResponse {
    // Extrahiere Nachrichten
    let messages: Vec<Message> = match serde_json::from_value(payload["messages"].clone()) {
        Ok(messages) => messages,
        Err(_) => return Json(json!({"error": "Ungültige Nachrichtendaten"})).into_response(),
    };

    // Sende Anfrage an GLM-Client und streame die Antwort
    match client.chat_completions_stream(messages).await {
        Ok(stream) => {
            let collected: Vec<_> = stream.collect().await;
            // Konvertiere Results zu JSON-Objekten
            let json_responses: Vec<serde_json::Value> = collected.into_iter().map(|result| {
                match result {
                    Ok(response) => serde_json::to_value(response).unwrap_or_else(|_| serde_json::json!({"error": "Serialization failed"})),
                    Err(err) => serde_json::json!({"error": err.to_string()}),
                }
            }).collect();
            Json(json!({"stream": json_responses})).into_response()
        },
        Err(err) => Json(json!({"error": err.to_string()})).into_response(),
    }
}
