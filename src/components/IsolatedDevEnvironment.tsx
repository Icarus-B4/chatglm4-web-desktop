import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { CodeArtifact } from '../types/chat';
import { X, Download, Copy, Play, ExternalLink, Maximize2, Minimize2, Code, RefreshCw, Server, FolderTree, Save, Archive, Sidebar } from 'lucide-react';
import JSZip from 'jszip';

interface IsolatedDevEnvironmentProps {
  artifacts: CodeArtifact[];
  isOpen: boolean;
  onClose: () => void;
}

export const IsolatedDevEnvironment: React.FC<IsolatedDevEnvironmentProps> = ({ artifacts, isOpen, onClose }) => {
  const [activeArtifact, setActiveArtifact] = useState<CodeArtifact | null>(
    artifacts.length > 0 ? artifacts[0] : null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidepanel, setShowSidepanel] = useState(false);
  const [savedArtifacts, setSavedArtifacts] = useState<CodeArtifact[]>([]);
  const [showCode, setShowCode] = useState(true);
  const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [serverPort, setServerPort] = useState<number | null>(null);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'logs'>('code');
  const [projectStructure, setProjectStructure] = useState<{name: string, children: any[]}[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Funktion zum Generieren des Vorschauinhalts basierend auf den Artefakten
  const generatePreviewContent = (artifacts: CodeArtifact[]): string => {
    console.log("Generiere Vorschauinhalt für Artefakte:", artifacts);
    
    // Suche nach HTML-Artefakt
    const htmlArtifact = artifacts.find(a => a.type === 'html' || a.filename.endsWith('.html'));
    
    // Suche nach CSS- und JS-Artefakten
    const cssArtifacts = artifacts.filter(a => a.type === 'css' || a.filename.endsWith('.css'));
    const jsArtifacts = artifacts.filter(a => a.type === 'js' || a.filename.endsWith('.js'));
    
    console.log(`CSS-Artefakte: ${cssArtifacts.length}, JS-Artefakte: ${jsArtifacts.length}`);
    
    // Wenn ein HTML-Artefakt gefunden wurde, verarbeite es, um externe Skripte durch Inline-Skripte zu ersetzen
    if (htmlArtifact) {
      console.log("HTML-Artefakt gefunden:", htmlArtifact.filename);
      
      // Extrahiere den Inhalt des HTML-Artefakts
      let htmlContent = htmlArtifact.content;
      
      // Ersetze externe Skript-Referenzen durch Inline-Skripte
      jsArtifacts.forEach(js => {
        const scriptSrcRegex = new RegExp(`<script[^>]*src=["']${js.filename}["'][^>]*>.*?</script>`, 'g');
        htmlContent = htmlContent.replace(scriptSrcRegex, `<script>${js.content}</script>`);
      });
      
      // Ersetze externe CSS-Referenzen durch Inline-Styles
      cssArtifacts.forEach(css => {
        const linkRegex = new RegExp(`<link[^>]*href=["']${css.filename}["'][^>]*>`, 'g');
        htmlContent = htmlContent.replace(linkRegex, `<style>${css.content}</style>`);
      });
      
      return htmlContent;
    }
    
    // Wenn kein HTML-Artefakt gefunden wurde, erstelle eine neue HTML-Seite
    let html = '<!DOCTYPE html>\n<html lang="de">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generierter Code</title>\n';
    
    // Füge CSS-Artefakte als Style-Tags hinzu
    cssArtifacts.forEach(css => {
      html += `  <style>\n${css.content}\n  </style>\n`;
    });
    
    html += '</head>\n<body>\n';
    
    // Prüfe, ob es sich um ein Snake-Spiel oder ein anderes spezielles Projekt handelt
    const isSnakeGame = artifacts.some(a => 
      a.content.includes('Snake Game') || 
      a.content.includes('gameCanvas') || 
      a.filename.toLowerCase().includes('snake')
    );
    
    if (isSnakeGame) {
      // Für Snake-Spiel: Füge eine Anleitung und das Canvas hinzu
      html += `
    <div style="text-align: center; padding: 20px; font-family: sans-serif;">
      <h1>Snake-Spiel</h1>
      <div class="score-container" style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 1.2rem;">
        <div class="score" style="background: rgba(0, 0, 0, 0.3); padding: 5px 15px; border-radius: 20px;">Score: <span id="score">0</span></div>
        <div class="high-score" style="background: rgba(0, 0, 0, 0.3); padding: 5px 15px; border-radius: 20px;">Highscore: <span id="highScore">0</span></div>
      </div>
      <canvas id="gameCanvas" width="400" height="400" style="background: #0c0e14; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);"></canvas>
      <div class="controls" style="margin-top: 20px;">
        <button id="startButton" style="background: #50fa7b; color: #282a36; border: none; padding: 10px 20px; font-size: 1rem; font-weight: bold; border-radius: 5px; cursor: pointer;">Spiel starten</button>
        <div class="instructions" style="margin-top: 15px; font-size: 0.9rem; opacity: 0.7;">
          <p>Steuerung: Pfeiltasten oder WASD</p>
        </div>
      </div>
    </div>
    `;
    } else {
      // Füge den Inhalt des ersten Artefakts als Hauptinhalt hinzu, wenn es kein HTML/CSS/JS ist
      const mainContent = artifacts.find(a => !a.type.match(/html|css|js/i) && !a.filename.match(/\.(html|css|js)$/i));
      
      if (mainContent) {
        html += `  <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px; overflow: auto;">${mainContent.content}</pre>\n`;
      } else {
        // Wenn kein Hauptinhalt gefunden wurde, zeige eine Liste der Artefakte an
        html += `
      <div style="max-width: 800px; margin: 40px auto; font-family: sans-serif; padding: 20px;">
        <h1 style="color: #333;">Generierter Code</h1>
        <p>Folgende Dateien wurden generiert:</p>
        <ul style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
      `;
        
        artifacts.forEach(artifact => {
          html += `  <li style="margin-bottom: 10px;"><strong>${artifact.filename}</strong> (${artifact.language})</li>\n`;
        });
        
        html += `
        </ul>
        <div style="margin-top: 30px; padding: 15px; background: #e9f5ff; border-radius: 5px; border-left: 5px solid #0066cc;">
          <p><strong>Hinweis:</strong> Um diese Dateien auszuführen, müssten sie in einer echten Entwicklungsumgebung installiert werden.</p>
        </div>
      </div>
      `;
      }
    }
    
    // Füge JS-Artefakte als Script-Tags hinzu
    jsArtifacts.forEach(js => {
      html += `  <script>\n${js.content}\n  </script>\n`;
    });
    
    html += '</body>\n</html>';
    
    return html;
  };

  // Innerhalb der useEffect-Funktion, die beim Öffnen ausgeführt wird
  useEffect(() => {
    if (isOpen && artifacts.length > 0) {
      console.log("Empfangene Artefakte:", artifacts);
      
      // Setze das erste Artefakt als aktiv
      setActiveArtifact(artifacts[0]);
      
      // Simuliere Projekterstellung
      createProjectStructure(artifacts);
      
      // Simuliere Server-Start mit Verzögerung
      setServerStatus('starting');
      setServerLogs(prev => [...prev, "Initialisiere isolierte Umgebung..."]);
      setServerLogs(prev => [...prev, "Erstelle temporäres Projektverzeichnis..."]);
      
      // Generiere spezifische Logs basierend auf den Artefakten
      const htmlFiles = artifacts.filter(a => a.type === 'html' || a.filename.endsWith('.html'));
      const jsFiles = artifacts.filter(a => a.type === 'js' || a.filename.endsWith('.js'));
      const cssFiles = artifacts.filter(a => a.type === 'css' || a.filename.endsWith('.css'));
      
      if (htmlFiles.length > 0) {
        setServerLogs(prev => [...prev, `HTML-Dateien gefunden: ${htmlFiles.map(f => f.filename).join(', ')}`]);
      }
      if (cssFiles.length > 0) {
        setServerLogs(prev => [...prev, `CSS-Dateien gefunden: ${cssFiles.map(f => f.filename).join(', ')}`]);
      }
      if (jsFiles.length > 0) {
        setServerLogs(prev => [...prev, `JavaScript-Dateien gefunden: ${jsFiles.map(f => f.filename).join(', ')}`]);
      }
      
      const timer = setTimeout(() => {
        setServerStatus('running');
        const randomPort = Math.floor(Math.random() * 1000) + 8000; // Zufälliger Port zwischen 8000-9000
        setServerPort(randomPort);
        setServerLogs(prev => [...prev, "Installiere Abhängigkeiten..."]);
        setServerLogs(prev => [...prev, "Konfiguriere Dev-Server..."]);
        setServerLogs(prev => [...prev, `Server gestartet auf Port ${randomPort}`]);
        setServerLogs(prev => [...prev, "Bereit für Vorschau!"]);
        
        // Automatisch zur Vorschau wechseln
        setActiveTab('preview');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, artifacts]);

  // Simulierte Projekterstellung
  const createProjectStructure = (artifacts: CodeArtifact[]) => {
    // Kategorisiere Artefakte nach Dateityp
    const htmlFiles = artifacts.filter(a => a.type === 'html' || a.filename.endsWith('.html'));
    const cssFiles = artifacts.filter(a => a.type === 'css' || a.filename.endsWith('.css'));
    const jsFiles = artifacts.filter(a => a.type === 'js' || a.filename.endsWith('.js'));
    const otherFiles = artifacts.filter(a => 
      !a.type.match(/html|css|js/i) && !a.filename.match(/\.(html|css|js)$/i)
    );

    // Erstelle eine realistische Projektstruktur basierend auf den Artefakten
    const structure = [
      {
        name: 'project',
        children: [
          {
            name: 'src',
            children: [
              ...jsFiles.map(file => ({ name: file.filename, type: 'file' })),
              ...otherFiles.map(file => ({ name: file.filename, type: 'file' }))
            ]
          },
          {
            name: 'public',
            children: [
              ...htmlFiles.map(file => ({ name: file.filename, type: 'file' })),
              ...cssFiles.map(file => ({ name: file.filename, type: 'file' }))
            ]
          },
          { name: 'package.json', type: 'file' },
          { name: 'README.md', type: 'file' }
        ]
      }
    ];
    
    setProjectStructure(structure);
  };

  React.useEffect(() => {
    if (artifacts.length > 0 && !activeArtifact) {
      setActiveArtifact(artifacts[0]);
    }
  }, [artifacts, activeArtifact]);

  const handleCopyCode = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Code kopiert!');
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  const handleDownloadCode = (artifact: CodeArtifact) => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Funktion zum Speichern eines Artefakts
  const handleSaveArtifact = (artifact: CodeArtifact) => {
    setSavedArtifacts(prev => {
      // Prüfe, ob das Artefakt bereits gespeichert ist
      const exists = prev.some(a => a.id === artifact.id);
      if (exists) return prev;
      return [...prev, artifact];
    });
  };

  // Funktion zum Herunterladen des gesamten Projekts als ZIP
  const handleDownloadProject = async () => {
    const zip = new JSZip();
    
    // Erstelle Ordnerstruktur
    const srcFolder = zip.folder("src");
    const publicFolder = zip.folder("public");
    
    if (!srcFolder || !publicFolder) {
      console.error("Fehler beim Erstellen der ZIP-Ordnerstruktur");
      return;
    }
    
    // Sortiere Artefakte nach Typ
    artifacts.forEach(artifact => {
      const isPublic = artifact.filename.startsWith('public/') || 
                      artifact.type === 'html' || 
                      artifact.filename === 'index.html';
      
      const targetFolder = isPublic ? publicFolder : srcFolder;
      const filename = artifact.filename.replace('public/', '').replace('src/', '');
      
      targetFolder.file(filename, artifact.content);
    });
    
    // Füge package.json hinzu, wenn nicht vorhanden
    if (!artifacts.some(a => a.filename === 'package.json')) {
      zip.file('package.json', JSON.stringify({
        name: "generated-project",
        version: "1.0.0",
        private: true,
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.2.0",
          "vite": "^5.0.0"
        }
      }, null, 2));
    }
    
    // Generiere und lade die ZIP-Datei herunter
    const blob = await zip.generateAsync({type: "blob"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartServer = () => {
    if (serverStatus === 'stopped') {
      setServerStatus('starting');
      setServerLogs(prev => [...prev, "Server wird gestartet..."]);
      
      setTimeout(() => {
        setServerStatus('running');
        const randomPort = Math.floor(Math.random() * 1000) + 8000;
        setServerPort(randomPort);
        setServerLogs(prev => [...prev, `Server läuft auf Port ${randomPort}`]);
      }, 1500);
    }
  };

  const handleStopServer = () => {
    if (serverStatus === 'running') {
      setServerStatus('stopped');
      setServerPort(null);
      setServerLogs(prev => [...prev, "Server gestoppt"]);
    }
  };

  const handleRestartServer = () => {
    if (serverStatus === 'running') {
      setServerStatus('starting');
      setServerLogs(prev => [...prev, "Server wird neu gestartet..."]);
      
      setTimeout(() => {
        setServerStatus('running');
        const randomPort = Math.floor(Math.random() * 1000) + 8000;
        setServerPort(randomPort);
        setServerLogs(prev => [...prev, `Server läuft auf Port ${randomPort}`]);
      }, 1500);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center",
      isFullscreen ? "inset-0" : "inset-4"
    )}>
      <div className={cn(
        "bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col",
        isFullscreen ? "w-full h-full" : "w-full max-w-7xl h-full max-h-[95vh]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Isolierte Entwicklungsumgebung
            </h2>
            {artifacts.length > 1 && (
              <div className="flex gap-2">
                {artifacts.map((artifact) => (
                  <button
                    key={artifact.id}
                    onClick={() => setActiveArtifact(artifact)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      activeArtifact?.id === artifact.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {artifact.filename}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidepanel(!showSidepanel)}
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center gap-2 text-sm",
                showSidepanel 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}
              title="Gespeicherte Artefakte anzeigen"
            >
              <Sidebar size={20} />
            </button>
            <button
              onClick={handleDownloadProject}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
              title="Projekt als ZIP herunterladen"
            >
              <Archive size={20} className="text-gray-500 dark:text-gray-400" />
              <span>ZIP Download</span>
            </button>
            <div className="flex items-center gap-2 mr-4">
              <div className={cn(
                "w-3 h-3 rounded-full",
                serverStatus === 'running' ? "bg-green-500" : 
                serverStatus === 'starting' ? "bg-yellow-500" : "bg-red-500"
              )} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {serverStatus === 'running' ? `Server läuft (Port ${serverPort})` : 
                 serverStatus === 'starting' ? "Server startet..." : "Server gestoppt"}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isFullscreen ? "Vollbild beenden" : "Vollbild"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 py-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'code' ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Code size={16} className="inline mr-2" />
            Code-Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors ml-2",
              activeTab === 'preview' ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <ExternalLink size={16} className="inline mr-2" />
            Live-Vorschau
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors ml-2",
              activeTab === 'logs' ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Server size={16} className="inline mr-2" />
            Server-Logs
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Project Structure Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Projektstruktur</h3>
              <FolderTree size={16} className="text-gray-500" />
            </div>
            <div className="text-sm">
              {projectStructure.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium">{item.name}/</div>
                  <div className="pl-4">
                    {item.children.map((child, childIndex) => (
                      <div key={childIndex} className="mt-1">
                        {child.children ? (
                          <>
                            <div className="font-medium">{child.name}/</div>
                            <div className="pl-4">
                              {child.children.map((file: any, fileIndex: number) => (
                                <div 
                                  key={fileIndex} 
                                  className={cn(
                                    "py-1 px-2 rounded cursor-pointer",
                                    activeArtifact?.filename === file.name ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                  )}
                                  onClick={() => {
                                    const artifact = artifacts.find(a => a.filename === file.name);
                                    if (artifact) setActiveArtifact(artifact);
                                  }}
                                >
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            {child.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'code' && activeArtifact && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {activeArtifact.filename}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {activeArtifact.language}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeArtifact.content)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                      title="Code kopieren"
                    >
                      <Copy size={14} />
                      Kopieren
                    </button>
                    <button
                      onClick={() => handleDownloadCode(activeArtifact)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                      title="Code herunterladen"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-auto p-6">
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto text-sm leading-relaxed font-mono h-full">
                    <code>{activeArtifact.content}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col">
                {/* Preview Controls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Live-Vorschau
                  </h3>
                  <div className="flex items-center gap-2">
                    {serverStatus === 'stopped' ? (
                      <button
                        onClick={handleStartServer}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Play size={14} />
                        Server starten
                      </button>
                    ) : serverStatus === 'running' ? (
                      <>
                        <button
                          onClick={handleRestartServer}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          <RefreshCw size={14} />
                          Neu starten
                        </button>
                        <button
                          onClick={handleStopServer}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <X size={14} />
                          Stoppen
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                        <RefreshCw size={14} className="animate-spin" />
                        Server startet...
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 p-4">
                  {serverStatus === 'running' ? (
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
                      title="Isolierte Vorschau"
                      sandbox="allow-scripts allow-same-origin"
                      srcDoc={generatePreviewContent(artifacts)}
                    />
                  ) : serverStatus === 'starting' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <RefreshCw size={40} className="animate-spin mx-auto mb-4 text-blue-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Server wird gestartet...</h3>
                        <p className="text-gray-600 dark:text-gray-400">Bitte warten, die Vorschau wird gleich verfügbar sein.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <Server size={40} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Server ist gestoppt</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Starte den Server, um eine Vorschau zu sehen.</p>
                        <button
                          onClick={handleStartServer}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Server starten
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Server-Logs
                  </h3>
                  <button
                    onClick={() => setServerLogs([])}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Logs löschen
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto bg-gray-900 text-gray-300 font-mono text-sm">
                  {serverLogs.length === 0 ? (
                    <div className="text-gray-500 italic">Keine Logs verfügbar</div>
                  ) : (
                    serverLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Saved Artifacts Sidepanel */}
          {showSidepanel && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Gespeicherte Artefakte
                </h3>
                {savedArtifacts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Keine gespeicherten Artefakte
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedArtifacts.map(artifact => (
                      <div
                        key={artifact.id}
                        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {artifact.filename}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {artifact.language}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveArtifact(artifact)}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded"
                          >
                            Öffnen
                          </button>
                          <button
                            onClick={() => handleDownloadCode(artifact)}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 