use axum::{extract::ws::{Message, WebSocket, WebSocketUpgrade}, response::IntoResponse, routing::get, Router, extract::State};
use futures::{SinkExt, StreamExt};
use std::sync::Arc;
use crate::client::{GlmClient, Message as ChatMessage};
use serde_json::json;

pub fn websocket_route(client: Arc<GlmClient>) -> Router {
    Router::new()
        .route("/ws", get(websocket_handler))
        .with_state(client)
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(client): State<Arc<GlmClient>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, client))
}

async fn handle_socket(mut socket: WebSocket, client: Arc<GlmClient>) {
    while let Some(Ok(msg)) = socket.next().await {
        if let Message::Text(text) = msg {
            // Parse incoming message
            let request: Result<serde_json::Value, _> = serde_json::from_str(&text);
            
            match request {
                Ok(data) => {
                    if let Some(content) = data.get("message").and_then(|m| m.as_str()) {
                        let messages = vec![ChatMessage::user(content)];
                        
                        // Handle streaming response
                        match client.chat_completions_stream(messages).await {
                            Ok(mut stream) => {
                                while let Some(result) = stream.next().await {
                                    match result {
                                        Ok(response) => {
                                            let json_response = json!({
                                                "type": "stream_chunk",
                                                "data": response
                                            });
                                            
                                            if let Ok(json_str) = serde_json::to_string(&json_response) {
                                                if socket.send(Message::Text(json_str)).await.is_err() {
                                                    break;
                                                }
                                            }
                                        },
                                        Err(err) => {
                                            let error_response = json!({
                                                "type": "error",
                                                "message": err.to_string()
                                            });
                                            
                                            if let Ok(json_str) = serde_json::to_string(&error_response) {
                                                let _ = socket.send(Message::Text(json_str)).await;
                                            }
                                            break;
                                        }
                                    }
                                }
                                
                                // Send completion marker
                                let completion = json!({
                                    "type": "stream_complete"
                                });
                                
                                if let Ok(json_str) = serde_json::to_string(&completion) {
                                    let _ = socket.send(Message::Text(json_str)).await;
                                }
                            },
                            Err(err) => {
                                let error_response = json!({
                                    "type": "error",
                                    "message": format!("Stream-Fehler: {}", err)
                                });
                                
                                if let Ok(json_str) = serde_json::to_string(&error_response) {
                                    let _ = socket.send(Message::Text(json_str)).await;
                                }
                            }
                        }
                    }
                },
                Err(_) => {
                    let error_response = json!({
                        "type": "error",
                        "message": "Ungültiges JSON-Format"
                    });
                    
                    if let Ok(json_str) = serde_json::to_string(&error_response) {
                        let _ = socket.send(Message::Text(json_str)).await;
                    }
                }
            }
        }
    }
}
