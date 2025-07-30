import { useState, useEffect, useCallback } from 'react';
import { CodeArtifact } from '../types/chat';
import { DAYTONA_CONFIG } from '../config/daytona';
import { createBrowserDaytona } from '../utils/daytonaBrowser';

export type DevEnvironmentMode = 'local_simulation' | 'daytona_cloud';

export interface DevServerStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  port: number | null;
  url: string | null;
  error: string | null;
  logs: string[];
  sandbox: any | null;
  mode: DevEnvironmentMode;
}

export const useDevServer = (artifacts: CodeArtifact[]) => {
  const [daytona, setDaytona] = useState<any | null>(null);
  const [serverStatus, setServerStatus] = useState<DevServerStatus>({
    status: 'stopped',
    port: null,
    url: null,
    error: null,
    logs: [],
    sandbox: null,
    mode: 'local_simulation', // Standardmäßig auf lokale Simulation setzen
  });

  useEffect(() => {
    // Initialisiere Daytona nur, wenn der Modus 'daytona_cloud' ist.
    if (serverStatus.mode === 'daytona_cloud' && !daytona) {
      try {
        const daytonaInstance = createBrowserDaytona({
          apiKey: DAYTONA_CONFIG.API_KEY,
          apiUrl: DAYTONA_CONFIG.API_URL
        });
        setDaytona(daytonaInstance);
        addLog('🌐 Browser-Daytona initialisiert');
      } catch (error) {
        addLog(`❌ Fehler bei der Daytona-Initialisierung: ${error}`);
        setServerStatus(prev => ({ ...prev, status: 'error', error: `Initialisierungsfehler: ${error}` }));
      }
    }
  }, [serverStatus.mode, daytona]);

  const addLog = useCallback((message: string) => {
    setServerStatus(prev => ({ ...prev, logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`] }));
  }, []);

  const setMode = useCallback((mode: DevEnvironmentMode) => {
    if (serverStatus.status === 'running') {
      addLog('Bitte stoppen Sie den aktuellen Server, bevor Sie den Modus wechseln.');
      return;
    }
    setServerStatus(prev => ({ ...prev, mode, logs: [], error: null }));
    if (mode === 'daytona_cloud') {
        addLog('Modus auf Daytona Cloud umgeschaltet. Initialisierung wird gestartet...');
    } else {
        addLog('Modus auf Lokale Simulation umgeschaltet.');
    }
  }, [serverStatus.status, addLog]);


  const startServer = useCallback(async () => {
    if (serverStatus.status === 'running' || serverStatus.status === 'starting') return;
    
    setServerStatus(prev => ({ ...prev, status: 'starting', error: null, logs: [] }));
    addLog(`🚀 Starte Umgebung im Modus: ${serverStatus.mode}`);

    let sandbox: any = null;

    try {
      if (serverStatus.mode === 'daytona_cloud') {
        if (!daytona) {
          throw new Error('Daytona ist nicht initialisiert.');
        }
        addLog('📦 Erstelle neue Daytona Sandbox...');
        try {
          sandbox = await daytona.create(DAYTONA_CONFIG.DEFAULT_SANDBOX);
          addLog(`✅ Sandbox '${sandbox.id}' erfolgreich erstellt!`);
        } catch (error: any) {
          if (error.message.includes('ERR_CERT_AUTHORITY_INVALID') || error.message.includes('Failed to fetch')) {
            addLog('❌ Daytona-Verbindung fehlgeschlagen (SSL/Netzwerk-Problem).');
            addLog('🔄 Wechsle automatisch zur lokalen Simulation.');
            setServerStatus(prev => ({ ...prev, mode: 'local_simulation' }));
            sandbox = await createLocalSimulation();
            addLog('✅ Lokale Simulation bereit.');
          } else {
            throw error; // Andere Fehler weiterwerfen
          }
        }
      } else {
        addLog('🔄 Starte lokale Simulation...');
        sandbox = await createLocalSimulation();
        addLog('✅ Lokale Simulation bereit.');
      }

      setServerStatus(prev => ({ ...prev, sandbox }));

      // Gemeinsame Logik für beide Modi
      const rootDir = await sandbox.getUserRootDir();
      const projectDir = `${rootDir}/app`;
      addLog(`Projektverzeichnis: ${projectDir}`);
      await sandbox.process.executeCommand(`mkdir -p ${projectDir}`);

      addLog('Lade generierte Dateien hoch...');
      for (const artifact of artifacts) {
        const filePath = `${projectDir}/${artifact.filename}`;
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        if (dirPath && dirPath !== projectDir) {
          await sandbox.process.executeCommand(`mkdir -p ${dirPath}`);
        }
        await sandbox.fs.uploadFile(Buffer.from(artifact.content), filePath);
      }
      addLog('✅ Dateien erfolgreich hochgeladen.');

      // Projekttyp erkennen und Server starten
      const hasPackageJson = artifacts.some(a => a.filename === 'package.json');
      if (hasPackageJson) {
        addLog('Node.js Projekt erkannt. Installiere Abhängigkeiten...');
        await sandbox.process.executeCommand("npm install", projectDir, undefined, DAYTONA_CONFIG.TIMEOUT);
        addLog('✅ Abhängigkeiten installiert. Starte Dev-Server...');
        await sandbox.process.executeCommand(`nohup npm run dev > dev-server.log 2>&1 &`, projectDir, { PORT: "3000" });
      } else {
        addLog('Statische HTML-Seite erkannt. Starte Python HTTP-Server...');
        await sandbox.process.executeCommand(`nohup python3 -m http.server 3000 > dev-server.log 2>&1 &`, projectDir);
      }
      
      addLog('Warte auf Server-Start (10s)...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      addLog('Hole Live-Vorschau-Link...');
      const preview = await sandbox.getPreviewLink(3000);
      addLog(`Vorschau verfügbar unter: ${preview.url}`);
      
      setServerStatus(prev => ({ ...prev, status: 'running', port: 3000, url: preview.url }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      addLog(`❌ Fehler beim Starten des Servers: ${errorMessage}`);
      // Wenn der Fehler im Cloud-Modus auftrat und ein Sandbox-Objekt existiert
      if (sandbox && serverStatus.mode === 'daytona_cloud' && daytona) {
          addLog(`Fehler aufgetreten. Bereinige Sandbox ${sandbox.id}...`);
          // Fehler beim Löschen hier ignorieren, um keine Endlosschleife zu erzeugen
          await daytona.delete(sandbox).catch((deleteError: any) => {
            console.error("Fehler beim Aufräumen der Sandbox:", deleteError);
            addLog("Warnung: Sandbox konnte nicht automatisch bereinigt werden.");
          });
          setServerStatus(prev => ({ ...prev, sandbox: null }));
      }
    }
  }, [artifacts, daytona, serverStatus.mode, addLog]);

  const stopServer = useCallback(async () => {
    if (serverStatus.status !== 'running' || !serverStatus.sandbox) return;
    
    addLog(`Stoppe Umgebung...`);
    if (serverStatus.mode === 'daytona_cloud' && daytona) {
        try {
            addLog(`Entferne Daytona Sandbox ${serverStatus.sandbox.id}...`);
            await daytona.delete(serverStatus.sandbox);
            addLog('✅ Sandbox erfolgreich entfernt.');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
            addLog(`❌ Fehler beim Stoppen des Servers: ${errorMessage}`);
            // Trotz Fehler den Status zurücksetzen
        }
    }
    
    setServerStatus({ 
        status: 'stopped', 
        port: null, 
        url: null, 
        error: null, 
        logs: [], 
        sandbox: null,
        mode: serverStatus.mode 
    });

  }, [daytona, serverStatus.sandbox, serverStatus.mode, addLog]);

  const restartServer = useCallback(async () => {
      await stopServer();
      // Kurze Pause, um sauberen Neustart zu gewährleisten
      setTimeout(() => {
        startServer();
      }, 500);
  }, [stopServer, startServer]);
  
  return { serverStatus, setMode, startServer, stopServer, restartServer };
};

// Lokale Simulation für Fallback
async function createLocalSimulation(): Promise<any> {
  const simulatedSandbox = {
    id: `local-sim-${Date.now()}`,
    async getUserRootDir() {
      return '/workspace';
    },
    process: {
      async executeCommand(command: string, cwd?: string) {
        console.log(`[SIM] Exec: ${command} in ${cwd || '/'}`);
        return { exitCode: 0, result: `Simulated: ${command}` };
      }
    },
    fs: {
      async uploadFile(buffer: Buffer, path: string) {
        console.log(`[SIM] Upload: ${path} (${buffer.length} bytes)`);
        return Promise.resolve();
      }
    },
    async getPreviewLink(port: number) {
        const url = `http://localhost:${port}`;
        console.log(`[SIM] Preview URL: ${url}`);
        // Erstelle eine Dummy-HTML-Seite, um die Vorschau zu simulieren
        const previewHtml = `
          <html>
            <head><title>Simulierte Vorschau</title></head>
            <body>
              <h1>Lokale Simulation</h1>
              <p>Dies ist eine simulierte Vorschau. Die generierte Anwendung läuft auf Port ${port}.</p>
              <p>Öffnen Sie Ihre Browser-Konsole für weitere Details.</p>
            </body>
          </html>
        `;
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        // Dies ist ein Trick, um eine "echte" URL zu haben, aber sie zeigt nur auf die Info-Seite.
        // Die eigentliche App muss manuell unter localhost:3000 geöffnet werden.
        return { url: blobUrl };
    }
  };
  await new Promise(resolve => setTimeout(resolve, 500));
  return simulatedSandbox;
}