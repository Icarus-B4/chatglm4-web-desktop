use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::client::types::ToolDefinition;
use async_trait::async_trait;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionDefinition {
    pub name: String,
    pub description: String,
    pub parameters: FunctionParameters,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionParameters {
    #[serde(rename = "type")]
    pub param_type: String,
    pub properties: HashMap<String, ParameterDefinition>,
    pub required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterDefinition {
    #[serde(rename = "type")]
    pub param_type: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enum_values: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionCall {
    pub name: String,
    pub arguments: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionResult {
    pub success: bool,
    pub result: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// Trait für Function Call Handler
#[async_trait::async_trait]
pub trait FunctionHandler: Send + Sync {
    async fn execute(&self, arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value, String>;
    fn definition(&self) -> ToolDefinition;
}

// Beispiel-Handler für Zeit-Abfrage
pub struct GetCurrentTime;

impl FunctionHandler for GetCurrentTime {
    async fn execute(&self, _arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value> {
        use chrono::{DateTime, Utc};
        let now: DateTime<Utc> = Utc::now();
        Ok(serde_json::json!({
            "timestamp": now.timestamp(),
            "iso": now.to_rfc3339(),
            "formatted": now.format("%Y-%m-%d %H:%M:%S UTC").to_string()
        }))
    }

    fn definition(&self) -> ToolDefinition {
        ToolDefinition::new_function(
            "get_current_time".to_string(),
            "Gibt die aktuelle Zeit zurück".to_string(),
            serde_json::json!({
                "type": "object",
                "properties": {},
                "required": []
            })
        )
    }
}

// Beispiel-Handler für Wetter-Abfrage
pub struct GetWeather;

impl FunctionHandler for GetWeather {
    async fn execute(&self, arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value> {
        let location = arguments.get("location")
            .and_then(|v| v.as_str())
            .unwrap_or("Berlin");
            
        // Simulierte Wetter-Daten
        Ok(serde_json::json!({
            "location": location,
            "temperature": 22,
            "condition": "Sonnig",
            "humidity": 65,
            "wind_speed": 12
        }))
    }

    fn definition(&self) -> ToolDefinition {
        ToolDefinition::new_function(
            "get_weather".to_string(),
            "Gibt aktuelle Wetter-Informationen für einen Ort zurück".to_string(),
            serde_json::json!({
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Die Stadt oder der Ort für die Wetter-Abfrage"
                    }
                },
                "required": ["location"]
            })
        )
    }
}
