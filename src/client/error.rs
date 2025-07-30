use thiserror::Error;

/// GLM API Client Fehlertypen
#[derive(Error, Debug)]
pub enum GlmError {
    #[error("HTTP Request Fehler: {0}")]
    HttpError(reqwest::Error),

    #[error("JSON Serialisierungsfehler: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("API Fehler: {status} - {message}")]
    ApiError { status: u16, message: String },

    #[error("Authentifizierungsfehler: API-Schlüssel fehlt oder ungültig")]
    AuthenticationError,

    #[error("Rate Limit erreicht: {message}")]
    RateLimitError { message: String },

    #[error("Modell nicht verfügbar: {model}")]
    ModelNotAvailable { model: String },

    #[error("Ungültige Anfrage: {message}")]
    InvalidRequest { message: String },

    #[error("Server Fehler: {message}")]
    ServerError { message: String },

    #[error("Streaming Fehler: {message}")]
    StreamingError { message: String },

    #[error("Timeout Fehler: Die Anfrage hat zu lange gedauert")]
    TimeoutError,

    #[error("Konfigurationsfehler: {message}")]
    ConfigError { message: String },

    #[error("Parsing Fehler: {message}")]
    ParsingError { message: String },

    #[error("Netzwerk Fehler: {message}")]
    NetworkError { message: String },

    #[error("Unbekannter Fehler: {message}")]
    Unknown { message: String },
}

impl GlmError {
    /// Erstellt einen API-Fehler aus HTTP-Status und Nachricht
    pub fn from_api_response(status: u16, message: String) -> Self {
        match status {
            401 => Self::AuthenticationError,
            429 => Self::RateLimitError { message },
            400..=499 => Self::InvalidRequest { message },
            500..=599 => Self::ServerError { message },
            _ => Self::ApiError { status, message },
        }
    }

    /// Prüft, ob der Fehler wiederholbar ist
    pub fn is_retryable(&self) -> bool {
        match self {
            Self::HttpError(e) => e.is_timeout() || e.is_connect(),
            Self::RateLimitError { .. } => true,
            Self::ServerError { .. } => true,
            Self::TimeoutError => true,
            Self::NetworkError { .. } => true,
            _ => false,
        }
    }

    /// Gibt die empfohlene Wartezeit vor einem Wiederholungsversuch zurück
    pub fn retry_delay(&self) -> Option<std::time::Duration> {
        match self {
            Self::RateLimitError { .. } => Some(std::time::Duration::from_secs(60)),
            Self::ServerError { .. } => Some(std::time::Duration::from_secs(5)),
            Self::TimeoutError => Some(std::time::Duration::from_secs(10)),
            Self::NetworkError { .. } => Some(std::time::Duration::from_secs(5)),
            _ => None,
        }
    }
}

impl From<reqwest::Error> for GlmError {
    fn from(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            Self::TimeoutError
        } else if error.is_connect() {
            Self::NetworkError {
                message: error.to_string(),
            }
        } else {
            Self::HttpError(error)
        }
    }
}

/// API Fehlerantwort Struktur
#[derive(Debug, serde::Deserialize)]
pub struct ApiErrorResponse {
    pub error: ApiErrorDetails,
}

#[derive(Debug, serde::Deserialize)]
pub struct ApiErrorDetails {
    pub message: String,
    #[serde(rename = "type")]
    pub error_type: Option<String>,
    pub code: Option<String>,
    pub param: Option<String>,
}

impl From<ApiErrorResponse> for GlmError {
    fn from(error_response: ApiErrorResponse) -> Self {
        let message = error_response.error.message;
        
        match error_response.error.error_type.as_deref() {
            Some("invalid_request_error") => Self::InvalidRequest { message },
            Some("authentication_error") => Self::AuthenticationError,
            Some("rate_limit_error") => Self::RateLimitError { message },
            Some("server_error") => Self::ServerError { message },
            _ => Self::Unknown { message },
        }
    }
}

/// Typ-Alias für Ergebnisse
pub type GlmResult<T> = Result<T, GlmError>;
