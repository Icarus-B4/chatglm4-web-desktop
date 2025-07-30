use super::function_call::{FunctionDefinition, FunctionHandler, FunctionResult, GetCurrentTime, GetWeather};
use std::collections::HashMap;
use std::sync::Arc;
use anyhow::Result;
use async_trait::async_trait;

pub struct FunctionRegistry {
    handlers: HashMap<String, Arc<dyn FunctionHandler>>,
}

impl FunctionRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            handlers: HashMap::new(),
        };
        
        // Registriere Built-in Funktionen
        registry.register("get_current_time", Arc::new(GetCurrentTime));
        registry.register("get_weather", Arc::new(GetWeather));
        
        registry
    }

    pub fn register(&mut self, name: &str, handler: Arc<dyn FunctionHandler>) {
        self.handlers.insert(name.to_string(), handler);
    }

    pub fn get_definitions(&self) -> Vec<FunctionDefinition> {
        self.handlers
            .values()
            .map(|handler| handler.definition())
            .collect()
    }

    pub async fn execute_function(
        &self,
        name: &str,
        arguments: HashMap<String, serde_json::Value>,
    ) -> FunctionResult {
        match self.handlers.get(name) {
            Some(handler) => {
                match handler.execute(arguments).await {
                    Ok(result) => FunctionResult {
                        success: true,
                        result,
                        error: None,
                    },
                    Err(err) => FunctionResult {
                        success: false,
                        result: serde_json::Value::Null,
                        error: Some(err.to_string()),
                    },
                }
            }
            None => FunctionResult {
                success: false,
                result: serde_json::Value::Null,
                error: Some(format!("Funktion '{}' nicht gefunden", name)),
            },
        }
    }

    pub fn has_function(&self, name: &str) -> bool {
        self.handlers.contains_key(name)
    }

    pub fn list_functions(&self) -> Vec<String> {
        self.handlers.keys().cloned().collect()
    }
}

impl Default for FunctionRegistry {
    fn default() -> Self {
        Self::new()
    }
}
