import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { CodeArtifact } from '../types/chat';
import { X, Download, Copy, Play, ExternalLink, Maximize2, Minimize2, Code, RefreshCw, Server, FolderTree } from 'lucide-react';

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
  const [showCode, setShowCode] = useState(true);
  const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [serverPort, setServerPort] = useState<number | null>(null);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'logs'>('code');
  const [projectStructure, setProjectStructure] = useState<{name: string, children: any[]}[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simulierte Projekterstellung und Server-Start
  useEffect(() => {
    if (isOpen && artifacts.length > 0) {
      // Simuliere Projekterstellung
      createProjectStructure(artifacts);
      
      // Simuliere Server-Start mit Verzögerung
      setServerStatus('starting');
      setServerLogs(prev => [...prev, "Initialisiere isolierte Umgebung..."]);
      setServerLogs(prev => [...prev, "Erstelle temporäres Projektverzeichnis..."]);
      
      const timer = setTimeout(() => {
        setServerStatus('running');
        const randomPort = Math.floor(Math.random() * 1000) + 8000; // Zufälliger Port zwischen 8000-9000
        setServerPort(randomPort);
        setServerLogs(prev => [...prev, "Installiere Abhängigkeiten..."]);
        setServerLogs(prev => [...prev, "Konfiguriere Dev-Server..."]);
        setServerLogs(prev => [...prev, `Server gestartet auf Port ${randomPort}`]);
        setServerLogs(prev => [...prev, "Bereit für Vorschau!"]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, artifacts]);

  // Simulierte Projekterstellung
  const createProjectStructure = (artifacts: CodeArtifact[]) => {
    const structure = [
      {
        name: 'project',
        children: [
          {
            name: 'src',
            children: artifacts.map(artifact => ({ name: artifact.filename, type: 'file' }))
          },
          {
            name: 'public',
            children: [
              { name: 'index.html', type: 'file' }
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
                      srcDoc={activeArtifact?.type === 'html' ? activeArtifact.content : '<html><body><h1>Vorschau läuft auf Port ' + serverPort + '</h1><p>Die Vorschau ist in einer isolierten Umgebung und kann sicher ausgeführt werden.</p></body></html>'}
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
        </div>
      </div>
    </div>
  );
}; 