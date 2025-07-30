// Browser-kompatible Daytona-Alternative
// Umgeht Node.js-spezifische APIs

interface DaytonaSandbox {
  id: string;
  status: 'running' | 'stopped' | 'starting';
  url?: string;
}

class BrowserDaytona {
  private apiKey: string;
  private apiUrl: string;
  
  constructor({ apiKey, apiUrl }: { apiKey: string; apiUrl: string }) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }
  
  async list(): Promise<DaytonaSandbox[]> {
    try {
      const response = await fetch(`${this.apiUrl}/sandboxes`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Failed to list sandboxes:', error);
      
      // SSL-Fehler spezifisch behandeln
      if (error.message.includes('ERR_CERT_AUTHORITY_INVALID') || error.message.includes('Failed to fetch')) {
        console.log('🔒 SSL/Network error detected, returning empty list for fallback');
        return []; // Leere Liste zurückgeben statt Fehler werfen
      }
      
      throw error;
    }
  }
  
  async create(config: { image: string; public: boolean }) {
    try {
      const response = await fetch(`${this.apiUrl}/sandboxes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const sandbox = await response.json();
      
      // Erweitere mit Browser-kompatiblen Methoden
      return {
        ...sandbox,
        async getUserRootDir() {
          return '/workspace';
        },
        process: {
          async executeCommand(command: string, cwd?: string) {
            console.log(`Executing: ${command} in ${cwd || '/'}`);
            
            // Simuliere Command-Execution via API
            const response = await fetch(`${this.apiUrl}/sandboxes/${sandbox.id}/exec`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ command, cwd })
            });
            
            if (!response.ok) {
              return { exitCode: 1, result: `Command failed: ${response.statusText}` };
            }
            
            const result = await response.json();
            return { exitCode: 0, result: result.output || 'Command executed' };
          }
        },
        fs: {
          async uploadFile(buffer: Buffer, path: string) {
            console.log(`Uploading file: ${path}`);
            
            // Konvertiere Buffer zu FormData für Browser
            const formData = new FormData();
            const blob = new Blob([buffer]);
            formData.append('file', blob, path.split('/').pop() || 'file');
            formData.append('path', path);
            
            const response = await fetch(`${this.apiUrl}/sandboxes/${sandbox.id}/files`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`
              },
              body: formData
            });
            
            if (!response.ok) {
              throw new Error(`File upload failed: ${response.statusText}`);
            }
            
            return await response.json();
          }
        },
        async getPreviewLink(port: number) {
          const response = await fetch(`${this.apiUrl}/sandboxes/${sandbox.id}/preview?port=${port}`, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Preview link failed: ${response.statusText}`);
          }
          
          return await response.json();
        }
      };
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      throw error;
    }
  }
  
  async delete(sandbox: { id: string }) {
    try {
      const response = await fetch(`${this.apiUrl}/sandboxes/${sandbox.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete sandbox:', error);
      throw error;
    }
  }
}

export { BrowserDaytona };

// Erstelle globale Instanz
export function createBrowserDaytona(config: { apiKey: string; apiUrl: string }) {
  return new BrowserDaytona(config);
}