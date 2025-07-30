use super::error::{GlmError, GlmResult};
use super::types::StreamingChatCompletionResponse;
use futures::{Stream, StreamExt};
use serde_json;
use std::pin::Pin;
use std::task::{Context, Poll};

/// Wrapper für Streaming-Antworten
pub struct StreamingResponse {
    inner: Pin<Box<dyn Stream<Item = GlmResult<StreamingChatCompletionResponse>> + Send>>,
}

impl StreamingResponse {
    pub fn new<S>(stream: S) -> Self
    where
        S: Stream<Item = GlmResult<StreamingChatCompletionResponse>> + Send + 'static,
    {
        Self {
            inner: Box::pin(stream),
        }
    }

    /// Sammelt alle Streaming-Chunks zu einer vollständigen Antwort
    pub async fn collect_content(mut self) -> GlmResult<String> {
        let mut content = String::new();
        
        while let Some(chunk_result) = self.next().await {
            let chunk = chunk_result?;
            
            if let Some(choice) = chunk.choices.first() {
                if let Some(delta_content) = &choice.delta.content {
                    content.push_str(delta_content);
                }
                
                // Prüfe auf Ende des Streams
                if choice.finish_reason.is_some() {
                    break;
                }
            }
        }
        
        Ok(content)
    }

    /// Verarbeitet jedes Chunk mit einer Callback-Funktion
    pub async fn for_each<F>(mut self, mut callback: F) -> GlmResult<()>
    where
        F: FnMut(&StreamingChatCompletionResponse) -> GlmResult<()>,
    {
        while let Some(chunk_result) = self.next().await {
            let chunk = chunk_result?;
            callback(&chunk)?;
            
            // Prüfe auf Ende des Streams
            if let Some(choice) = chunk.choices.first() {
                if choice.finish_reason.is_some() {
                    break;
                }
            }
        }
        
        Ok(())
    }
}

impl Stream for StreamingResponse {
    type Item = GlmResult<StreamingChatCompletionResponse>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.inner.as_mut().poll_next(cx)
    }
}

/// Hilfsfunktion zum Parsen von Server-Sent Events
pub fn parse_sse_line(line: &str) -> Option<GlmResult<StreamingChatCompletionResponse>> {
    // Überspringe leere Zeilen und Kommentare
    if line.is_empty() || line.starts_with(':') {
        return None;
    }

    // Suche nach "data: " Präfix
    if let Some(data) = line.strip_prefix("data: ") {
        // Überspringe [DONE] Marker
        if data.trim() == "[DONE]" {
            return None;
        }

        // Parse JSON
        match serde_json::from_str::<StreamingChatCompletionResponse>(data) {
            Ok(response) => Some(Ok(response)),
            Err(err) => Some(Err(GlmError::StreamingError {
                message: format!("Fehler beim Parsen von SSE-Daten: {}", err),
            })),
        }
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::client::types::{Delta, Role, StreamChoice};

    #[test]
    fn test_parse_sse_line() {
        let json_data = r#"{"id":"test","object":"chat.completion.chunk","created":1234567890,"model":"glm-4.5","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}"#;
        let line = format!("data: {}", json_data);
        
        let result = parse_sse_line(&line);
        assert!(result.is_some());
        
        match result.unwrap() {
            Ok(response) => {
                assert_eq!(response.id, "test");
                assert_eq!(response.model, "glm-4.5");
                assert_eq!(response.choices.len(), 1);
                assert_eq!(response.choices[0].delta.content, Some("Hello".to_string()));
            }
            Err(_) => panic!("Parsing sollte erfolgreich sein"),
        }
    }

    #[test]
    fn test_parse_sse_line_done() {
        let result = parse_sse_line("data: [DONE]");
        assert!(result.is_none());
    }

    #[test]
    fn test_parse_sse_line_empty() {
        let result = parse_sse_line("");
        assert!(result.is_none());
    }
}
