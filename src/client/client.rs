use super::types::{ChatCompletionRequest, ChatCompletionResponse, GlmConfig, Message, StreamingChatCompletionResponse};
use super::error::{GlmError, GlmResult, ApiErrorResponse};
use reqwest::{Client, Response, Url};
use futures::StreamExt;
use std::time::Duration;

/// GLM API Client
#[derive(Debug, Clone)]
pub struct GlmClient {
    client: Client,
    config: GlmConfig,
}

impl GlmClient {
    /// Erstellt einen neuen GlmClient
    pub fn new(config: GlmConfig) -> GlmResult<Self> {
        // Validiere API-Key
        if config.api_key.trim().is_empty() {
            return Err(GlmError::ConfigError { 
                message: "API-Key darf nicht leer sein".to_string() 
            });
        }

        let client = Client::builder()
            .timeout(config.timeout)
            .build()
            .map_err(|err| GlmError::ConfigError { message: err.to_string() })?;

        Ok(Self { client, config })
    }

    /// Erstellt einen Chat Completion Request
    pub async fn chat_completions(&self, messages: Vec<Message>) -> GlmResult<ChatCompletionResponse> {
        let request = ChatCompletionRequest::new(self.config.model.to_string(), messages)
            .with_stream(self.config.stream)
            .with_max_tokens(self.config.max_tokens)
            .with_temperature(self.config.temperature)
            .with_top_p(self.config.top_p)
            .with_thinking(self.config.thinking_enabled);

        let url = format!("{}/chat/completions", self.config.api_url.trim_end_matches('/'));
        let url = Url::parse(&url).map_err(|err| GlmError::ConfigError { message: err.to_string() })?;

        let response = self.client
            .post(url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .json(&request)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    /// Handhabt die API-Antwort
    async fn handle_response(response: Response) -> GlmResult<ChatCompletionResponse> {
        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            let api_error = match serde_json::from_str::<ApiErrorResponse>(&text) {
                Ok(error_response) => GlmError::from(error_response),
                Err(_) => GlmError::from_api_response(status.as_u16(), text),
            };
            return Err(api_error);
        }

        let completion_response: ChatCompletionResponse = serde_json::from_str(&text)?;
        Ok(completion_response)
    }

    /// Handhabt die API-Antwort für Streaming
    pub async fn chat_completions_stream<'a>(&'a self, messages: Vec<Message>) -> GlmResult<impl futures::Stream<Item = GlmResult<StreamingChatCompletionResponse>> + 'a> {
        let request = ChatCompletionRequest::new(self.config.model.to_string(), messages)
            .with_stream(true)
            .with_max_tokens(self.config.max_tokens)
            .with_temperature(self.config.temperature)
            .with_top_p(self.config.top_p)
            .with_thinking(self.config.thinking_enabled);

        let url = format!("{}/chat/completions", self.config.api_url.trim_end_matches('/'));
        let url = Url::parse(&url).map_err(|err| GlmError::ConfigError { message: err.to_string() })?;

        let response = self.client
            .post(url)
            .header("Authorization", format!("Bearer {}", self.config.api_key.clone()))
            .json(&request)
            .send()
            .await?
            .error_for_status()?;

        Ok(Self::stream_response(response).await)
    }

    /// Streamt die Antwort
    async fn stream_response(response: Response) -> impl futures::Stream<Item = GlmResult<StreamingChatCompletionResponse>> {
        let stream = response.bytes_stream().map(|result| {
            result.map_err(GlmError::from).and_then(|bytes| {
                let text = String::from_utf8(bytes.to_vec()).map_err(|err| GlmError::StreamingError {
                    message: format!("UTF-8 Dekodierungsfehler: {}", err),
                })?;
                serde_json::from_str::<StreamingChatCompletionResponse>(&text).map_err(GlmError::from)
            })
        });

        stream
    }
}

