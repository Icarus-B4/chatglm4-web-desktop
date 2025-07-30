use axum::{extract::Path, response::IntoResponse, routing::{get, post}, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::functions::{FunctionRegistry, FunctionCall};

#[derive(Debug, Serialize, Deserialize)]
struct ExecuteFunctionRequest {
    name: String,
    arguments: std::collections::HashMap<String, serde_json::Value>,
}

pub fn functions_routes() -> Router {
    let registry = Arc::new(FunctionRegistry::new());
    
    // Erweitere Registry mit zusätzlichen Funktionen
    let mut enhanced_registry = FunctionRegistry::new();
    enhanced_registry.register("calculate", Arc::new(crate::functions::Calculator));
    enhanced_registry.register("analyze_text", Arc::new(crate::functions::TextAnalyzer));
    enhanced_registry.register("generate_uuid", Arc::new(crate::functions::UuidGenerator));
    
    let registry = Arc::new(enhanced_registry);
    
    Router::new()
        .route("/api/functions", get(list_functions))
        .route("/api/functions/definitions", get(get_function_definitions))
        .route("/api/functions/execute", post(execute_function))
        .route("/api/functions/:name", get(get_function_info))
        .with_state(registry)
}

async fn list_functions(registry: Arc<FunctionRegistry>) -> impl IntoResponse {
    let functions = registry.list_functions();
    
    Json(json!({
        "functions": functions,
        "count": functions.len(),
        "status": "success"
    }))
}

async fn get_function_definitions(registry: Arc<FunctionRegistry>) -> impl IntoResponse {
    let definitions = registry.get_definitions();
    
    Json(json!({
        "definitions": definitions,
        "count": definitions.len(),
        "status": "success"
    }))
}

async fn execute_function(
    registry: Arc<FunctionRegistry>,
    Json(request): Json<ExecuteFunctionRequest>
) -> impl IntoResponse {
    let result = registry.execute_function(&request.name, request.arguments).await;
    
    Json(json!({
        "function_name": request.name,
        "result": result,
        "status": if result.success { "success" } else { "error" }
    }))
}

async fn get_function_info(
    Path(name): Path<String>,
    registry: Arc<FunctionRegistry>
) -> impl IntoResponse {
    if !registry.has_function(&name) {
        return Json(json!({
            "error": format!("Funktion '{}' existiert nicht", name),
            "status": "not_found"
        }));
    }

    let definitions = registry.get_definitions();
    let definition = definitions.iter().find(|def| def.name == name);

    match definition {
        Some(def) => Json(json!({
            "function": def,
            "status": "success"
        })),
        None => Json(json!({
            "error": format!("Definition für Funktion '{}' nicht gefunden", name),
            "status": "error"
        }))
    }
}
