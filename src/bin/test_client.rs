use chatglm_web::client::{GlmClient, GlmConfig, GlmModel, Message};
use dotenv::dotenv;
use tracing::{error, info};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Lade Umgebungsvariablen
    dotenv().ok();
    
    // Initialisiere Logging
    tracing_subscriber::fmt::init();

    info!("Teste GLM-4.5 API Client...");

    // Lade Konfiguration aus Umgebungsvariablen
    let config = match GlmConfig::from_env() {
        Ok(config) => {
            info!("Konfiguration erfolgreich geladen");
            info!("API URL: {}", config.api_url);
            info!("Modell: {:?}", config.model);
            config
        }
        Err(e) => {
            error!("Fehler beim Laden der Konfiguration: {}", e);
            return Err(e);
        }
    };

    // Erstelle Client
    let client = match GlmClient::new(config) {
        Ok(client) => {
            info!("GLM Client erfolgreich erstellt");
            client
        }
        Err(e) => {
            error!("Fehler beim Erstellen des Clients: {}", e);
            return Err(Box::new(e));
        }
    };

    // Teste einfache Chat-Completion
    let messages = vec![
        Message::system("Du bist ein hilfsreicher Assistent."),
        Message::user("Hallo! Kannst du mir helfen?"),
    ];

    info!("Sende Chat-Completion Request...");
    match client.chat_completions(messages).await {
        Ok(response) => {
            info!("Chat-Completion erfolgreich!");
            info!("Response ID: {}", response.id);
            info!("Modell: {}", response.model);
            
            if let Some(choice) = response.choices.first() {
                if let Some(content) = &choice.message.content {
                    info!("Antwort: {}", content);
                } else {
                    info!("Antwort: [Leere Antwort]");
                }
            }
            
            if let Some(usage) = response.usage {
                info!("Token-Verbrauch - Prompt: {}, Completion: {}, Total: {}", 
                      usage.prompt_tokens, usage.completion_tokens, usage.total_tokens);
            }
        }
        Err(e) => {
            error!("Chat-Completion Fehler: {}", e);
            match &e {
                chatglm_web::client::GlmError::AuthenticationError => {
                    error!("Überprüfe deinen API-Schlüssel in der .env Datei");
                }
                chatglm_web::client::GlmError::NetworkError { message } => {
                    error!("Netzwerkfehler: {}", message);
                }
                _ => {
                    error!("Unbekannter Fehler");
                }
            }
            return Err(Box::new(e));
        }
    }

    info!("Test erfolgreich abgeschlossen!");
    Ok(())
}
