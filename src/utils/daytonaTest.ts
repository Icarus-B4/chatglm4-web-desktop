import { DAYTONA_CONFIG } from '../config/daytona';

export async function testDaytonaConnection(): Promise<{success: boolean, error?: string, sandboxes?: any[], details?: string}> {
  try {
    console.log('🧪 Testing Daytona connection...');
    console.log('API Key:', DAYTONA_CONFIG.API_KEY.substring(0, 10) + '...');
    console.log('API URL:', DAYTONA_CONFIG.API_URL);
    
    // Test direkt mit fetch API, um SSL-Probleme zu diagnostizieren
    console.log('📡 Testing direct API connection...');
    
    const response = await fetch(`${DAYTONA_CONFIG.API_URL}/sandboxes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAYTONA_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const sandboxes = await response.json();
      console.log('✅ Connection successful!');
      console.log('Existing sandboxes:', sandboxes);
      
      return {
        success: true,
        sandboxes: Array.isArray(sandboxes) ? sandboxes : [],
        details: `API Status: ${response.status} ${response.statusText}`
      };
    } else {
      console.log(`⚠️ API response: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: 'Möglicherweise ungültiger API-Key oder falscher Endpoint'
      };
    }
    
  } catch (error: any) {
    console.error('❌ Daytona connection failed:', error);
    
    let details = '';
    
    // Spezifische SSL-Fehlerbehandlung
    if (error.message.includes('ERR_CERT_AUTHORITY_INVALID')) {
      details = '🔒 SSL-Zertifikat Problem! Möglicherweise Self-Hosted Daytona mit ungültigem Zertifikat. Lokale Simulation wird verwendet.';
    } else if (error.message.includes('Failed to fetch')) {
      details = '🌐 Netzwerk-Problem! Prüfe API-URL und Internetverbindung. Lokale Simulation wird als Fallback verwendet.';
    } else {
      details = '⚠️ Unbekannter Fehler. Lokale Simulation wird verwendet.';
    }
    
    return {
      success: false,
      error: error.message,
      details: details
    };
  }
}

export async function createTestSandbox(): Promise<{success: boolean, sandbox?: any, error?: string}> {
  try {
    console.log('🚀 Creating test sandbox...');
    
    const response = await fetch(`${DAYTONA_CONFIG.API_URL}/sandboxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAYTONA_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: 'node:18',
        public: true
      })
    });
    
    if (response.ok) {
      const sandbox = await response.json();
      console.log('✅ Test sandbox created:', sandbox);
      
      return {
        success: true,
        sandbox: sandbox
      };
    } else {
      console.log(`❌ Failed to create sandbox: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Create failed: ${response.status} ${response.statusText}`
      };
    }
    
  } catch (error: any) {
    console.error('❌ Test sandbox creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testDaytonaConnection(): Promise<{success: boolean, error?: string, sandboxes?: any[], details?: string}> {
  try {
    console.log('🧪 Testing Daytona connection...');
    console.log('API Key:', DAYTONA_CONFIG.API_KEY.substring(0, 10) + '...');
    console.log('API URL:', DAYTONA_CONFIG.API_URL);
    
    // Test direkt mit fetch API, um SSL-Probleme zu diagnostizieren
    console.log('📡 Testing direct API connection...');
    
    const response = await fetch(`${DAYTONA_CONFIG.API_URL}/sandboxes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAYTONA_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const sandboxes = await response.json();
      console.log('✅ Connection successful!');
      console.log('Existing sandboxes:', sandboxes);
      
      return {
        success: true,
        sandboxes: Array.isArray(sandboxes) ? sandboxes : [],
        details: `API Status: ${response.status} ${response.statusText}`
      };
    } else {
      console.log(`⚠️ API response: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: 'Möglicherweise ungültiger API-Key oder falscher Endpoint'
      };
    }
    
  } catch (error: any) {
    console.error('❌ Daytona connection failed:', error);
    
    let details = '';
    
    // Spezifische SSL-Fehlerbehandlung
    if (error.message.includes('ERR_CERT_AUTHORITY_INVALID')) {
      details = '🔒 SSL-Zertifikat Problem! Möglicherweise Self-Hosted Daytona mit ungültigem Zertifikat. Lokale Simulation wird verwendet.';
    } else if (error.message.includes('Failed to fetch')) {
      details = '🌐 Netzwerk-Problem! Prüfe API-URL und Internetverbindung. Lokale Simulation wird als Fallback verwendet.';
    } else {
      details = '⚠️ Unbekannter Fehler. Lokale Simulation wird verwendet.';
    }
    
    return {
      success: false,
      error: error.message,
      details: details
    };
  }
}

export async function createTestSandbox(): Promise<{success: boolean, sandbox?: any, error?: string}> {
  try {
    console.log('🚀 Creating test sandbox...');
    
    const response = await fetch(`${DAYTONA_CONFIG.API_URL}/sandboxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAYTONA_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: 'node:18',
        public: true
      })
    });
    
    if (response.ok) {
      const sandbox = await response.json();
      console.log('✅ Test sandbox created:', sandbox);
      
      return {
        success: true,
        sandbox: sandbox
      };
    } else {
      console.log(`❌ Failed to create sandbox: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Create failed: ${response.status} ${response.statusText}`
      };
    }
    
  } catch (error: any) {
    console.error('❌ Test sandbox creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}