// ChatGLM API Konfiguration
export const API_CONFIG = {
  // API-Key - wird aus der .env Datei geladen oder kann hier direkt gesetzt werden
  API_KEY: 'e686c68079c74262831b38e7663ec744.JXLD8p1rWUbEge3a', // Ersetze dies mit deinem echten API-Key
  
  // API-Endpunkt (verschiedene Optionen für Z.AI)
  BASE_URL: 'https://api.z.ai/api/paas/v4',
  // Alternative: 'https://open.bigmodel.cn/api/paas/v4',
  
  // Model-Konfiguration (korrekt für Z.AI)
  MODEL: 'glm-4.5',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  
  // Timeout
  TIMEOUT: 30000, // 30 Sekunden
  
  // Demo-Modus (falls API nicht verfügbar)
  USE_DEMO_MODE: false, // Setze auf false für echte API
}; 