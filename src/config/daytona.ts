// Daytona SDK Konfiguration (Browser-kompatibel)
export const DAYTONA_CONFIG = {
  // API-Schlüssel - direkt gesetzt für Browser-Umgebung
  API_KEY: 'dtn_1ccfd7ced16d9e8bc7a71965429ce9d612b9a3673c997da1bb2b702e39e14050',
  
  // API-URL
  API_URL: 'https://api.daytona.io/v1',
  
  // Standard Sandbox Konfiguration
  DEFAULT_SANDBOX: {
    image: 'node:20',
    public: true
  },
  
  // Timeout
  TIMEOUT: 180000 // 3 Minuten
}; 