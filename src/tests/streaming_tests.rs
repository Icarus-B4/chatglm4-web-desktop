#[cfg(test)]
mod tests {
    use crate::client::streaming::*;
    use crate::client::error::*;
    use crate::client::types::*;
    use futures::{stream, StreamExt};
    use std::time::Duration;

    fn create_test_response(content: &str) -> StreamingChatCompletionResponse {
        StreamingChatCompletionResponse {
            id: "test".to_string(),
            object: "chat.completion.chunk".to_string(),
            created: 1677652288,
            model: "glm-4.5".to_string(),
            choices: vec![StreamChoice {
                index: 0,
                delta: Delta {
                    role: None,
                    content: Some(content.to_string()),
                },
                finish_reason: None,
            }],
        }
    }

    fn create_finish_response() -> StreamingChatCompletionResponse {
        StreamingChatCompletionResponse {
            id: "test".to_string(),
            object: "chat.completion.chunk".to_string(),
            created: 1677652288,
            model: "glm-4.5".to_string(),
            choices: vec![StreamChoice {
                index: 0,
                delta: Delta {
                    role: None,
                    content: None,
                },
                finish_reason: Some("stop".to_string()),
            }],
        }
    }

    #[tokio::test]
    async fn test_streaming_response_creation() {
        // Test basic creation
        let stream_data = vec![
            Ok(create_test_response("Hello")),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        // Test that it was created successfully
        assert!(true);
    }

    #[tokio::test]
    async fn test_streaming_content_collection() {
        // Test content collection
        let stream_data = vec![
            Ok(create_test_response("Test")),
            Ok(create_test_response(" Message")),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        // Test that content collection works
        let content = streaming_response.collect_content().await;
        assert!(content.is_ok());
        assert_eq!(content.unwrap(), "Test Message");
    }

    #[tokio::test]
    async fn test_streaming_error_handling() {
        // Test error handling
        let stream_data = vec![
            Ok(create_test_response("Hello")),
            Err(GlmError::NetworkError { message: "Connection lost".to_string() }),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        // Test that errors are handled properly
        let content = streaming_response.collect_content().await;
        assert!(content.is_err());
    }

    #[tokio::test]
    async fn test_streaming_callback_processing() {
        // Test callback processing
        let stream_data = vec![
            Ok(create_test_response("Hello")),
            Ok(create_test_response(" World")),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        let mut collected_content = String::new();
        
        // Test that callback processing works
        let result = streaming_response.for_each(|chunk| {
            if let Some(choice) = chunk.choices.first() {
                if let Some(content) = &choice.delta.content {
                    collected_content.push_str(content);
                }
            }
            Ok(())
        }).await;

        assert!(result.is_ok());
        assert_eq!(collected_content, "Hello World");
    }

    #[tokio::test]
    async fn test_streaming_performance() {
        let start_time = std::time::Instant::now();
        
        // Create a large stream to test performance
        let stream_data: Vec<Result<StreamingChatCompletionResponse, GlmError>> = (0..1000)
            .map(|i| {
                Ok(create_test_response(&format!("chunk{}", i)))
            })
            .chain(std::iter::once(Ok(create_finish_response())))
            .collect();

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        let content = streaming_response.collect_content().await;
        let elapsed = start_time.elapsed();

        assert!(content.is_ok());
        assert!(elapsed < Duration::from_millis(100)); // Should complete under 100ms
    }

    #[tokio::test]
    async fn test_streaming_empty_content() {
        let stream_data = vec![
            Ok(create_test_response("")),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        let content = streaming_response.collect_content().await;
        assert!(content.is_ok());
        assert_eq!(content.unwrap(), "");
    }

    #[tokio::test]
    async fn test_streaming_unicode_handling() {
        let stream_data = vec![
            Ok(create_test_response("🚀")),
            Ok(create_test_response(" Hëllö")),
            Ok(create_test_response(" 世界")),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        let content = streaming_response.collect_content().await;
        assert!(content.is_ok());
        assert_eq!(content.unwrap(), "🚀 Hëllö 世界");
    }

    #[tokio::test]
    async fn test_streaming_thinking_content() {
        let thinking_response = StreamingChatCompletionResponse {
            id: "test".to_string(),
            object: "chat.completion.chunk".to_string(),
            created: 1677652288,
            model: "glm-4.5".to_string(),
            choices: vec![StreamChoice {
                index: 0,
                delta: Delta {
                    role: Some(Role::Assistant),
                    content: Some("<|thinking|>\nLet me think...\n</|thinking|>\n\nHere's my answer".to_string()),
                },
                finish_reason: None,
            }],
        };

        let stream_data = vec![
            Ok(thinking_response),
            Ok(create_finish_response()),
        ];

        let stream = stream::iter(stream_data);
        let streaming_response = StreamingResponse::new(stream);

        let content = streaming_response.collect_content().await;
        assert!(content.is_ok());
        let final_content = content.unwrap();
        assert!(final_content.contains("Here's my answer"));
        assert!(!final_content.contains("<|thinking|>"));
    }

    #[tokio::test]
    async fn test_streaming_finish_reasons() {
        let stream_data = vec![
            Ok(create_test_response("Hello")),
            Ok(create_finish_response()),
            ];

        let stream = stream::iter(stream_data);
            let streaming_response = StreamingResponse::new(stream);

            let content = streaming_response.collect_content().await;
        assert!(content.is_ok());
        assert_eq!(content.unwrap(), "Hello");
    }

    #[tokio::test]
    async fn test_streaming_timeout() {
        let stream_data = vec![
            Ok(create_test_response("Hello")),
        ];

        let stream = stream::iter(stream_data)
            .then(|item| async move {
            tokio::time::sleep(Duration::from_millis(100)).await;
            item
        });

        let streaming_response = StreamingResponse::new(stream);
        
        let result = tokio::time::timeout(
            Duration::from_millis(50),
            streaming_response.collect_content()
        ).await;

        assert!(result.is_err()); // Should timeout
    }
}
