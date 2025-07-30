// Browser-kompatible Daytona-Alternative
// Umgeht Node.js-spezifische APIs

interface DaytonaSandbox {
  id: string;
  status: 'running' | 'stopped' | 'starting';
  url?: string;
}

interface CommandResult {
  exitCode: number;
  result: string;
}

interface FileUploadResult {
  success: boolean;
  path: string;
}

interface PreviewLinkResult {
  url: string;
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
      const apiKey = this.apiKey;
      const apiUrl = this.apiUrl;
      
      return {
        ...sandbox,
        async getUserRootDir(): Promise<string> {
          return '/workspace';
        },
        process: {
          async executeCommand(command: string, cwd?: string): Promise<CommandResult> {
            console.log(`Executing: ${command} in ${cwd || '/'}`);
            
            // Simuliere Command-Execution via API
            const execResponse = await fetch(`${apiUrl}/sandboxes/${sandbox.id}/exec`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ command, cwd })
            });
            
            if (!execResponse.ok) {
              return { exitCode: 1, result: `Command failed: ${execResponse.statusText}` };
            }
            
            const result = await execResponse.json();
            return { exitCode: 0, result: result.output || 'Command executed' };
          }
        },
        fs: {
          async uploadFile(buffer: Buffer, path: string): Promise<FileUploadResult> {
            console.log(`Uploading file: ${path}`);
            
            // Konvertiere Buffer zu FormData für Browser
            const formData = new FormData();
            const blob = new Blob([buffer]);
            formData.append('file', blob, path.split('/').pop() || 'file');
            formData.append('path', path);
            
            const uploadResponse = await fetch(`${apiUrl}/sandboxes/${sandbox.id}/files`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`
              },
              body: formData
            });
            
            if (!uploadResponse.ok) {
              throw new Error(`File upload failed: ${uploadResponse.statusText}`);
            }
            
            return await uploadResponse.json();
          }
        },
        async getPreviewLink(port: number): Promise<PreviewLinkResult> {
          const previewResponse = await fetch(`${apiUrl}/sandboxes/${sandbox.id}/preview?port=${port}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });
          
          if (!previewResponse.ok) {
            throw new Error(`Preview link failed: ${previewResponse.statusText}`);
          }
          
          return await previewResponse.json();
        }
      };
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      throw error;
    }
  }
  
  async delete(sandbox: { id: string }): Promise<boolean> {
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
export function createBrowserDaytona(config: { apiKey: string; apiUrl: string }): BrowserDaytona {
  return new BrowserDaytona(config);
}