use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Verfügbare GLM-4.5 Modelle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GlmModel {
    #[serde(rename = "glm-4.5")]
    Glm45,
    #[serde(rename = "glm-4.5-32k")]
    Glm4532K,
    #[serde(rename = "glm-4.5-turbo")]
    Glm45Turbo,
}

impl Default for GlmModel {
    fn default() -> Self {
        Self::Glm45
    }
}

impl ToString for GlmModel {
    fn to_string(&self) -> String {
        match self {
            GlmModel::Glm45 => "glm-4.5".to_string(),
            GlmModel::Glm4532K => "glm-4.5-32k".to_string(),
            GlmModel::Glm45Turbo => "glm-4.5-turbo".to_string(),
        }
    }
}

/// Chat-Nachrichtrolle
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    System,
    User,
    Assistant,
}

/// Tool Call für Function Calling
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCall {
    pub id: String,
    #[serde(rename = "type")]
    pub call_type: String,
    pub function: FunctionCall,
}

/// Function Call Details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionCall {
    pub name: String,
    pub arguments: String,
}

/// Tool Call Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCallResult {
    pub tool_call_id: String,
    pub output: String,
    pub error: Option<String>,
}

/// Message Content (kann Text oder Tool Calls enthalten)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MessageContent {
    Text(String),
    ToolCalls(Vec<ToolCall>),
}

/// Chat-Nachricht
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_calls: Option<Vec<ToolCall>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_call_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thinking: Option<String>,
}

impl Message {
    pub fn system(content: impl Into<String>) -> Self {
        Self {
            role: Role::System,
            content: Some(content.into()),
            tool_calls: None,
            tool_call_id: None,
            thinking: None,
        }
    }

    pub fn user(content: impl Into<String>) -> Self {
        Self {
            role: Role::User,
            content: Some(content.into()),
            tool_calls: None,
            tool_call_id: None,
            thinking: None,
        }
    }

    pub fn assistant(content: impl Into<String>) -> Self {
        Self {
            role: Role::Assistant,
            content: Some(content.into()),
            tool_calls: None,
            tool_call_id: None,
            thinking: None,
        }
    }

    pub fn assistant_with_tool_calls(tool_calls: Vec<ToolCall>) -> Self {
        Self {
            role: Role::Assistant,
            content: None,
            tool_calls: Some(tool_calls),
            tool_call_id: None,
            thinking: None,
        }
    }

    pub fn tool_result(tool_call_id: String, content: impl Into<String>) -> Self {
        Self {
            role: Role::System, // Tool results are typically system messages
            content: Some(content.into()),
            tool_calls: None,
            tool_call_id: Some(tool_call_id),
            thinking: None,
        }
    }

    pub fn with_thinking(mut self, thinking: impl Into<String>) -> Self {
        self.thinking = Some(thinking.into());
        self
    }
}

/// Thinking-Konfiguration für GLM-4.5
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThinkingConfig {
    #[serde(rename = "type")]
    pub thinking_type: ThinkingType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ThinkingType {
    Enabled,
    Disabled,
}

impl Default for ThinkingConfig {
    fn default() -> Self {
        Self {
            thinking_type: ThinkingType::Enabled,
        }
    }
}

/// Tool/Function Definition für GLM-4.5
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    #[serde(rename = "type")]
    pub tool_type: String, // Always "function" for GLM-4.5
    pub function: FunctionDefinition,
}

/// Function Definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionDefinition {
    pub name: String,
    pub description: String,
    pub parameters: serde_json::Value, // JSON Schema
}

impl ToolDefinition {
    pub fn new_function(name: String, description: String, parameters: serde_json::Value) -> Self {
        Self {
            tool_type: "function".to_string(),
            function: FunctionDefinition {
                name,
                description,
                parameters,
            },
        }
    }
}

/// Tool Choice für GLM-4.5
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ToolChoice {
    None(String), // "none"
    Auto(String), // "auto"
    Required(String), // "required"
    Specific { 
        #[serde(rename = "type")]
        tool_type: String, // "function"
        function: SpecificFunction,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecificFunction {
    pub name: String,
}

impl ToolChoice {
    pub fn none() -> Self {
        Self::None("none".to_string())
    }
    
    pub fn auto() -> Self {
        Self::Auto("auto".to_string())
    }
    
    pub fn required() -> Self {
        Self::Required("required".to_string())
    }
    
    pub fn specific_function(name: String) -> Self {
        Self::Specific {
            tool_type: "function".to_string(),
            function: SpecificFunction { name },
        }
    }
}

/// Chat-Completion-Request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<Message>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thinking: Option<ThinkingConfig>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<ToolDefinition>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_choice: Option<ToolChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logit_bias: Option<HashMap<String, f32>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
}

impl ChatCompletionRequest {
    pub fn new(model: String, messages: Vec<Message>) -> Self {
        Self {
            model,
            messages,
            thinking: Some(ThinkingConfig::default()),
            tools: None,
            tool_choice: None,
            stream: None,
            max_tokens: None,
            temperature: None,
            top_p: None,
            presence_penalty: None,
            frequency_penalty: None,
            logit_bias: None,
            user: None,
        }
    }

    pub fn with_stream(mut self, stream: bool) -> Self {
        self.stream = Some(stream);
        self
    }

    pub fn with_max_tokens(mut self, max_tokens: u32) -> Self {
        self.max_tokens = Some(max_tokens);
        self
    }

    pub fn with_temperature(mut self, temperature: f32) -> Self {
        self.temperature = Some(temperature);
        self
    }

    pub fn with_top_p(mut self, top_p: f32) -> Self {
        self.top_p = Some(top_p);
        self
    }

    pub fn with_thinking(mut self, enabled: bool) -> Self {
        self.thinking = Some(ThinkingConfig {
            thinking_type: if enabled {
                ThinkingType::Enabled
            } else {
                ThinkingType::Disabled
            },
        });
        self
    }

    pub fn with_user(mut self, user: impl Into<String>) -> Self {
        self.user = Some(user.into());
        self
    }
}

/// Usage-Statistiken
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

/// Choice für Chat-Completion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Choice {
    pub index: u32,
    pub message: Message,
    pub finish_reason: Option<String>,
}

/// Delta für Streaming-Responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delta {
    pub content: Option<String>,
    pub role: Option<Role>,
}

/// Choice für Streaming-Responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChoice {
    pub index: u32,
    pub delta: Delta,
    pub finish_reason: Option<String>,
}

/// Chat-Completion-Response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<Choice>,
    pub usage: Option<Usage>,
}

/// Streaming Chat-Completion-Response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamingChatCompletionResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<StreamChoice>,
}

/// Client-Konfiguration
#[derive(Debug, Clone)]
pub struct GlmConfig {
    pub api_key: String,
    pub api_url: String,
    pub model: GlmModel,
    pub max_tokens: u32,
    pub temperature: f32,
    pub top_p: f32,
    pub stream: bool,
    pub thinking_enabled: bool,
    pub timeout: std::time::Duration,
}

impl Default for GlmConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            api_url: "https://api.z.ai/v1".to_string(),
            model: GlmModel::default(),
            max_tokens: 4096,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        }
    }
}

impl GlmConfig {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        use std::env;

        let api_key = env::var("GLM_API_KEY")
            .map_err(|_| "GLM_API_KEY Umgebungsvariable nicht gefunden")?;

        let api_url = env::var("GLM_API_URL")
            .unwrap_or_else(|_| "https://api.z.ai/v1".to_string());

        let model = env::var("GLM_MODEL")
            .unwrap_or_else(|_| "glm-4.5".to_string());
        
        let model = match model.as_str() {
            "glm-4.5" => GlmModel::Glm45,
            "glm-4.5-32k" => GlmModel::Glm4532K,
            "glm-4.5-turbo" => GlmModel::Glm45Turbo,
            _ => GlmModel::Glm45,
        };

        let max_tokens = env::var("GLM_MAX_TOKENS")
            .unwrap_or_else(|_| "4096".to_string())
            .parse()
            .unwrap_or(4096);

        let temperature = env::var("GLM_TEMPERATURE")
            .unwrap_or_else(|_| "0.7".to_string())
            .parse()
            .unwrap_or(0.7);

        let top_p = env::var("GLM_TOP_P")
            .unwrap_or_else(|_| "0.9".to_string())
            .parse()
            .unwrap_or(0.9);

        let stream = env::var("GLM_STREAM")
            .unwrap_or_else(|_| "false".to_string())
            .parse()
            .unwrap_or(false);

        let thinking_enabled = env::var("GLM_THINKING_ENABLED")
            .unwrap_or_else(|_| "true".to_string())
            .parse()
            .unwrap_or(true);

        Ok(Self {
            api_key,
            api_url,
            model,
            max_tokens,
            temperature,
            top_p,
            stream,
            thinking_enabled,
            timeout: std::time::Duration::from_secs(30),
        })
    }

    pub fn with_api_key(mut self, api_key: impl Into<String>) -> Self {
        self.api_key = api_key.into();
        self
    }

    pub fn with_model(mut self, model: GlmModel) -> Self {
        self.model = model;
        self
    }

    pub fn with_stream(mut self, stream: bool) -> Self {
        self.stream = stream;
        self
    }

    pub fn with_timeout(mut self, timeout: std::time::Duration) -> Self {
        self.timeout = timeout;
        self
    }
}
