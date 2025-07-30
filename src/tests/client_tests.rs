#[cfg(test)]
mod tests {
    use crate::client::*;
    use crate::client::types::*;
    use crate::client::error::*;
    use tokio_test;
    use wiremock::{MockServer, Mock, ResponseTemplate};
    use wiremock::matchers::{method, path, header};
    use serde_json::json;
    use test_case::test_case;
    use proptest::prelude::*;

    #[tokio::test]
    async fn test_glm_config_creation() {
        let config = GlmConfig {
            api_key: "test-key".to_string(),
            api_url: "https://api.test.com".to_string(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.8,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        assert_eq!(config.api_key, "test-key");
        assert_eq!(config.api_url, "https://api.test.com");
        assert_eq!(config.max_tokens, 2048);
    }

    #[test_case(GlmModel::Glm45, "glm-4.5"; "GLM 4.5 model")]
    #[test_case(GlmModel::Glm4532K, "glm-4.5-32k"; "GLM 4.5 32K model")]
    #[test_case(GlmModel::Glm45Turbo, "glm-4.5-turbo"; "GLM 4.5 Turbo model")]
    fn test_glm_model_to_string(model: GlmModel, expected: &str) {
        assert_eq!(model.to_string(), expected);
    }

    #[tokio::test]
    async fn test_message_creation() {
        let system_msg = Message::system("Du bist ein Assistent");
        assert!(matches!(system_msg.role, Role::System));
        assert_eq!(system_msg.content.unwrap(), "Du bist ein Assistent");

        let user_msg = Message::user("Hallo Welt");
        assert!(matches!(user_msg.role, Role::User));
        assert_eq!(user_msg.content.unwrap(), "Hallo Welt");

        let assistant_msg = Message::assistant("Hallo! Wie kann ich helfen?");
        assert!(matches!(assistant_msg.role, Role::Assistant));
        assert_eq!(assistant_msg.content.unwrap(), "Hallo! Wie kann ich helfen?");
    }

    #[tokio::test]
    async fn test_chat_completion_request_builder() {
        let messages = vec![
            Message::system("System prompt"),
            Message::user("User message"),
        ];

        let request = ChatCompletionRequest::new("glm-4.5".to_string(), messages.clone())
            .with_stream(true)
            .with_max_tokens(1024)
            .with_temperature(0.7)
            .with_top_p(0.8)
            .with_thinking(false);

        assert_eq!(request.model, "glm-4.5");
        assert_eq!(request.messages.len(), 2);
        assert_eq!(request.stream, Some(true));
        assert_eq!(request.max_tokens, Some(1024));
        assert_eq!(request.temperature, Some(0.7));
        assert_eq!(request.top_p, Some(0.8));
        assert!(request.thinking.is_some());
    }

    #[tokio::test]
    async fn test_tool_definition_creation() {
        let params = json!({
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Suchbegriff"
                }
            },
            "required": ["query"]
        });

        let tool = ToolDefinition::new_function(
            "search".to_string(),
            "Suche nach Informationen".to_string(),
            params.clone(),
        );

        assert_eq!(tool.tool_type, "function");
        assert_eq!(tool.function.name, "search");
        assert_eq!(tool.function.description, "Suche nach Informationen");
        assert_eq!(tool.function.parameters, params);
    }

    #[tokio::test]
    async fn test_tool_choice_variants() {
        let none_choice = ToolChoice::none();
        let auto_choice = ToolChoice::auto();
        let required_choice = ToolChoice::required();
        let specific_choice = ToolChoice::specific_function("search".to_string());

        assert!(matches!(none_choice, ToolChoice::None(_)));
        assert!(matches!(auto_choice, ToolChoice::Auto(_)));
        assert!(matches!(required_choice, ToolChoice::Required(_)));
        assert!(matches!(specific_choice, ToolChoice::Specific { .. }));
    }

    #[tokio::test]
    async fn test_glm_client_creation_success() {
        let config = GlmConfig {
            api_key: "valid-key".to_string(),
            api_url: "https://api.test.com".to_string(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        let client = GlmClient::new(config);
        assert!(client.is_ok());
    }

    #[tokio::test]
    async fn test_glm_client_creation_empty_api_key() {
        let config = GlmConfig {
            api_key: "".to_string(),
            api_url: "https://api.test.com".to_string(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        let client = GlmClient::new(config);
        assert!(client.is_err());
        assert!(matches!(client.unwrap_err(), GlmError::ConfigError { .. }));
    }

    #[tokio::test]
    async fn test_chat_completion_success() {
        let mock_server = MockServer::start().await;

        let response_body = json!({
            "id": "chatcmpl-123",
            "object": "chat.completion",
            "created": 1677652288,
            "model": "glm-4.5",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Hallo! Wie kann ich Ihnen helfen?"
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": 9,
                "completion_tokens": 12,
                "total_tokens": 21
            }
        });

        Mock::given(method("POST"))
            .and(path("/chat/completions"))
            .and(header("authorization", "Bearer test-key"))
            .respond_with(ResponseTemplate::new(200).set_body_json(&response_body))
            .mount(&mock_server)
            .await;

        let config = GlmConfig {
            api_key: "test-key".to_string(),
            api_url: mock_server.uri(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        let client = GlmClient::new(config).unwrap();
        let messages = vec![Message::user("Hallo")];

        let response = client.chat_completions(messages).await;
        assert!(response.is_ok());
        
        let response = response.unwrap();
        assert_eq!(response.id, "chatcmpl-123");
        assert_eq!(response.model, "glm-4.5");
        assert_eq!(response.choices.len(), 1);
        assert_eq!(response.choices[0].message.content.as_ref().unwrap(), "Hallo! Wie kann ich Ihnen helfen?");
    }

    #[tokio::test]
    async fn test_chat_completion_authentication_error() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/chat/completions"))
            .respond_with(ResponseTemplate::new(401).set_body_json(json!({
                "error": {
                    "message": "Invalid API key",
                    "type": "authentication_error",
                    "code": "invalid_api_key"
                }
            })))
            .mount(&mock_server)
            .await;

        let config = GlmConfig {
            api_key: "invalid-key".to_string(),
            api_url: mock_server.uri(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        let client = GlmClient::new(config).unwrap();
        let messages = vec![Message::user("Test")];

        let response = client.chat_completions(messages).await;
        assert!(response.is_err());
        assert!(matches!(response.unwrap_err(), GlmError::AuthenticationError));
    }

    #[tokio::test]
    async fn test_chat_completion_rate_limit_error() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/chat/completions"))
            .respond_with(ResponseTemplate::new(429).set_body_json(json!({
                "error": {
                    "message": "Rate limit exceeded",
                    "type": "rate_limit_error"
                }
            })))
            .mount(&mock_server)
            .await;

        let config = GlmConfig {
            api_key: "test-key".to_string(),
            api_url: mock_server.uri(),
            model: GlmModel::Glm45,
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            thinking_enabled: true,
            timeout: std::time::Duration::from_secs(30),
        };

        let client = GlmClient::new(config).unwrap();
        let messages = vec![Message::user("Test")];

        let response = client.chat_completions(messages).await;
        assert!(response.is_err());
        assert!(matches!(response.unwrap_err(), GlmError::RateLimitError { .. }));
    }

    // Property-based tests
    proptest! {
        #[test]
        fn test_message_content_roundtrip(content in ".*") {
            let message = Message::user(&content);
            assert_eq!(message.content.unwrap(), content);
        }

        #[test]
        fn test_temperature_bounds(temp in 0.0f32..2.0f32) {
            let request = ChatCompletionRequest::new(
                "glm-4.5".to_string(),
                vec![Message::user("test")]
            ).with_temperature(temp);
            
            assert_eq!(request.temperature, Some(temp));
        }

        #[test]
        fn test_max_tokens_positive(tokens in 1u32..32768u32) {
            let request = ChatCompletionRequest::new(
                "glm-4.5".to_string(),
                vec![Message::user("test")]
            ).with_max_tokens(tokens);
            
            assert_eq!(request.max_tokens, Some(tokens));
        }
    }

    #[tokio::test]
    async fn test_serialization_deserialization() {
        let original_message = Message::user("Test message");
        let serialized = serde_json::to_string(&original_message).unwrap();
        let deserialized: Message = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(original_message.content, deserialized.content);
        assert!(matches!(deserialized.role, Role::User));
    }

    #[tokio::test]
    async fn test_request_serialization() {
        let messages = vec![
            Message::system("System prompt"),
            Message::user("User query"),
        ];

        let request = ChatCompletionRequest::new("glm-4.5".to_string(), messages)
            .with_stream(true)
            .with_temperature(0.7);

        let serialized = serde_json::to_string(&request).unwrap();
        let deserialized: ChatCompletionRequest = serde_json::from_str(&serialized).unwrap();

        assert_eq!(request.model, deserialized.model);
        assert_eq!(request.messages.len(), deserialized.messages.len());
        assert_eq!(request.stream, deserialized.stream);
        assert_eq!(request.temperature, deserialized.temperature);
    }
}
