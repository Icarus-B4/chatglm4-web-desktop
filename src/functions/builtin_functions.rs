use super::function_call::{FunctionDefinition, FunctionHandler, ParameterDefinition, FunctionParameters};
use crate::client::types::ToolDefinition;
use std::collections::HashMap;
use async_trait::async_trait;

// Mathematische Berechnungen
pub struct Calculator;

impl FunctionHandler for Calculator {
    async fn execute(&self, arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value> {
        let expression = arguments.get("expression")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow::anyhow!("Fehlender Parameter 'expression'"))?;

        // Einfache mathematische Ausdrücke evaluieren
        // Hier würde normalerweise ein Math-Parser verwendet
        let result = match expression {
            exp if exp.contains("+") => {
                let parts: Vec<&str> = exp.split('+').collect();
                if parts.len() == 2 {
                    let a: f64 = parts[0].trim().parse()?;
                    let b: f64 = parts[1].trim().parse()?;
                    a + b
                } else {
                    return Err(anyhow::anyhow!("Ungültiger Ausdruck"));
                }
            },
            exp if exp.contains("-") => {
                let parts: Vec<&str> = exp.split('-').collect();
                if parts.len() == 2 {
                    let a: f64 = parts[0].trim().parse()?;
                    let b: f64 = parts[1].trim().parse()?;
                    a - b
                } else {
                    return Err(anyhow::anyhow!("Ungültiger Ausdruck"));
                }
            },
            exp if exp.contains("*") => {
                let parts: Vec<&str> = exp.split('*').collect();
                if parts.len() == 2 {
                    let a: f64 = parts[0].trim().parse()?;
                    let b: f64 = parts[1].trim().parse()?;
                    a * b
                } else {
                    return Err(anyhow::anyhow!("Ungültiger Ausdruck"));
                }
            },
            exp if exp.contains("/") => {
                let parts: Vec<&str> = exp.split('/').collect();
                if parts.len() == 2 {
                    let a: f64 = parts[0].trim().parse()?;
                    let b: f64 = parts[1].trim().parse()?;
                    if b == 0.0 {
                        return Err(anyhow::anyhow!("Division durch Null"));
                    }
                    a / b
                } else {
                    return Err(anyhow::anyhow!("Ungültiger Ausdruck"));
                }
            },
            _ => return Err(anyhow::anyhow!("Nicht unterstützter Ausdruck")),
        };

        Ok(serde_json::json!({
            "expression": expression,
            "result": result
        }))
    }

    fn definition(&self) -> FunctionDefinition {
        let mut properties = HashMap::new();
        properties.insert(
            "expression".to_string(),
            ParameterDefinition {
                param_type: "string".to_string(),
                description: "Mathematischer Ausdruck zum Berechnen (z.B. '2 + 3')".to_string(),
                enum_values: None,
            },
        );

        FunctionDefinition {
            name: "calculate".to_string(),
            description: "Führt einfache mathematische Berechnungen durch".to_string(),
            parameters: FunctionParameters {
                param_type: "object".to_string(),
                properties,
                required: vec!["expression".to_string()],
            },
        }
    }
}

// Text-Utilities
pub struct TextAnalyzer;

impl FunctionHandler for TextAnalyzer {
    async fn execute(&self, arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value> {
        let text = arguments.get("text")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow::anyhow!("Fehlender Parameter 'text'"))?;

        let word_count = text.split_whitespace().count();
        let char_count = text.chars().count();
        let line_count = text.lines().count();
        let paragraph_count = text.split("\n\n").count();

        Ok(serde_json::json!({
            "text": text,
            "analysis": {
                "word_count": word_count,
                "character_count": char_count,
                "line_count": line_count,
                "paragraph_count": paragraph_count,
                "avg_words_per_line": if line_count > 0 { word_count as f64 / line_count as f64 } else { 0.0 }
            }
        }))
    }

    fn definition(&self) -> FunctionDefinition {
        let mut properties = HashMap::new();
        properties.insert(
            "text".to_string(),
            ParameterDefinition {
                param_type: "string".to_string(),
                description: "Der zu analysierende Text".to_string(),
                enum_values: None,
            },
        );

        FunctionDefinition {
            name: "analyze_text".to_string(),
            description: "Analysiert einen Text und gibt Statistiken zurück".to_string(),
            parameters: FunctionParameters {
                param_type: "object".to_string(),
                properties,
                required: vec!["text".to_string()],
            },
        }
    }
}

// UUID-Generator
pub struct UuidGenerator;

impl FunctionHandler for UuidGenerator {
    async fn execute(&self, arguments: HashMap<String, serde_json::Value>) -> Result<serde_json::Value> {
        let count = arguments.get("count")
            .and_then(|v| v.as_u64())
            .unwrap_or(1)
            .min(10) as usize; // Maximum 10 UUIDs

        let uuids: Vec<String> = (0..count)
            .map(|_| uuid::Uuid::new_v4().to_string())
            .collect();

        Ok(serde_json::json!({
            "uuids": uuids,
            "count": count
        }))
    }

    fn definition(&self) -> FunctionDefinition {
        let mut properties = HashMap::new();
        properties.insert(
            "count".to_string(),
            ParameterDefinition {
                param_type: "integer".to_string(),
                description: "Anzahl der zu generierenden UUIDs (max. 10)".to_string(),
                enum_values: None,
            },
        );

        FunctionDefinition {
            name: "generate_uuid".to_string(),
            description: "Generiert eine oder mehrere UUIDs".to_string(),
            parameters: FunctionParameters {
                param_type: "object".to_string(),
                properties,
                required: vec![],
            },
        }
    }
}
