import React from 'react';
import { cn } from '../lib/utils';
import { CodeArtifact } from '../types/chat';
import { X, Download, Copy, Play, ExternalLink, Maximize2, Minimize2, Code } from 'lucide-react';

interface FullscreenPreviewProps {
  artifacts: CodeArtifact[];
  isOpen: boolean;
  onClose: () => void;
}

export const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ artifacts, isOpen, onClose }) => {
  const [activeArtifact, setActiveArtifact] = React.useState<CodeArtifact | null>(
    artifacts.length > 0 ? artifacts[0] : null
  );
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showCode, setShowCode] = React.useState(true);

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

  const handleRunCode = (artifact: CodeArtifact) => {
    if (artifact.type === 'html') {
      try {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(artifact.content);
          newWindow.document.close();
          console.log('HTML-Code in neuem Tab geöffnet');
        } else {
          alert('Popup-Blocker verhindert das Öffnen des neuen Tabs. Bitte erlaube Popups für diese Seite.');
        }
      } catch (error) {
        console.error('Fehler beim Öffnen des HTML-Codes:', error);
        alert('Fehler beim Öffnen des HTML-Codes: ' + error);
      }
    } else if (artifact.type === 'js') {
      try {
        // Erstelle eine sichere Umgebung für JavaScript-Ausführung
        const sandboxWindow = window.open('', '_blank', 'width=800,height=600');
        if (sandboxWindow) {
          // Erstelle eine HTML-Seite mit dem JavaScript-Code
          const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Ausführung - ${artifact.filename}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #007acc;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .output {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            min-height: 100px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
        }
        .error {
            background: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        .success {
            background: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }
        .console-log {
            background: #e2e3e5;
            border-color: #d6d8db;
            color: #383d41;
            margin: 5px 0;
            padding: 8px;
            border-radius: 4px;
        }
        .console-error {
            background: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        .console-warn {
            background: #fff3cd;
            border-color: #ffeaa7;
            color: #856404;
        }
        .console-info {
            background: #d1ecf1;
            border-color: #bee5eb;
            color: #0c5460;
        }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #005a9e;
        }
        .controls {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 JavaScript Ausführung</h1>
            <p>Datei: ${artifact.filename}</p>
        </div>
        
        <div class="controls">
            <button onclick="runCode()">▶️ Code ausführen</button>
            <button onclick="clearOutput()">🗑️ Ausgabe löschen</button>
            <button onclick="showCode()">📄 Code anzeigen</button>
        </div>
        
        <div id="output" class="output">
            Klicke auf "Code ausführen" um den JavaScript-Code zu starten...
        </div>
        
        <div id="codeDisplay" style="display: none;">
            <h3>📄 JavaScript Code:</h3>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto;">${artifact.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
    </div>

    <script>
        // Console-Override für bessere Ausgabe
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
        
        const outputDiv = document.getElementById('output');
        
        function addToOutput(message, type = 'log') {
            const div = document.createElement('div');
            div.className = 'console-' + type;
            div.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
            outputDiv.appendChild(div);
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
        
        // Override console methods
        console.log = (...args) => {
            originalConsole.log(...args);
            args.forEach(arg => addToOutput(arg, 'log'));
        };
        
        console.error = (...args) => {
            originalConsole.error(...args);
            args.forEach(arg => addToOutput(arg, 'error'));
        };
        
        console.warn = (...args) => {
            originalConsole.warn(...args);
            args.forEach(arg => addToOutput(arg, 'warn'));
        };
        
        console.info = (...args) => {
            originalConsole.info(...args);
            args.forEach(arg => addToOutput(arg, 'info'));
        };
        
        function runCode() {
            try {
                outputDiv.innerHTML = '<div class="console-info">🚀 Starte JavaScript-Ausführung...</div>';
                
                // Führe den Code aus
                const result = eval(\`${artifact.content.replace(/`/g, '\\`')}\`);
                
                if (result !== undefined) {
                    addToOutput('✅ Rückgabewert: ' + result, 'success');
                }
                
                addToOutput('✅ Code erfolgreich ausgeführt!', 'success');
                
            } catch (error) {
                addToOutput('❌ Fehler: ' + error.message, 'error');
                console.error('JavaScript-Ausführungsfehler:', error);
            }
        }
        
        function clearOutput() {
            outputDiv.innerHTML = '<div class="console-info">Ausgabe gelöscht. Klicke auf "Code ausführen" um den JavaScript-Code zu starten...</div>';
        }
        
        function showCode() {
            const codeDisplay = document.getElementById('codeDisplay');
            if (codeDisplay.style.display === 'none') {
                codeDisplay.style.display = 'block';
            } else {
                codeDisplay.style.display = 'none';
            }
        }
        
        // Automatisch ausführen wenn gewünscht
        // runCode();
    </script>
</body>
</html>`;
          
          sandboxWindow.document.write(htmlContent);
          sandboxWindow.document.close();
          console.log('JavaScript-Code in neuem Tab geöffnet');
        } else {
          alert('Popup-Blocker verhindert das Öffnen des neuen Tabs. Bitte erlaube Popups für diese Seite.');
        }
              } catch (error) {
          console.error('Fehler beim Ausführen des JavaScript-Codes:', error);
          alert('Fehler beim Ausführen des JavaScript-Codes: ' + (error instanceof Error ? error.message : String(error)));
        }
    } else if (artifact.type === 'css') {
      try {
        // Erstelle eine HTML-Seite mit dem CSS-Code
        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview - ${artifact.filename}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #007acc;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .preview-area {
            border: 2px dashed #ccc;
            padding: 20px;
            margin: 20px 0;
            min-height: 200px;
            background: white;
        }
        .code-display {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            overflow-x: auto;
        }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #005a9e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 CSS Preview</h1>
            <p>Datei: ${artifact.filename}</p>
        </div>
        
        <button onclick="toggleCode()">📄 Code anzeigen/verbergen</button>
        
        <div id="codeDisplay" class="code-display" style="display: none;">
            <h3>CSS Code:</h3>
            <pre>${artifact.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        
        <div class="preview-area" id="previewArea">
            <h2>CSS Preview Bereich</h2>
            <p>Hier wird dein CSS angewendet. Füge HTML-Elemente hinzu um die Styles zu testen.</p>
            <div class="demo-element">
                <h3>Demo Element</h3>
                <p>Dies ist ein Beispiel-Element um deine CSS-Styles zu testen.</p>
                <button>Demo Button</button>
            </div>
        </div>
    </div>

    <style id="dynamicCSS">
        ${artifact.content}
    </style>

    <script>
        function toggleCode() {
            const codeDisplay = document.getElementById('codeDisplay');
            if (codeDisplay.style.display === 'none') {
                codeDisplay.style.display = 'block';
            } else {
                codeDisplay.style.display = 'none';
            }
        }
    </script>
</body>
</html>`;
        
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          console.log('CSS-Code in neuem Tab geöffnet');
        } else {
          alert('Popup-Blocker verhindert das Öffnen des neuen Tabs. Bitte erlaube Popups für diese Seite.');
        }
             } catch (error) {
         console.error('Fehler beim Öffnen des CSS-Codes:', error);
         alert('Fehler beim Öffnen des CSS-Codes: ' + (error instanceof Error ? error.message : String(error)));
       }
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
              Vollbild Code Preview
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

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeArtifact && (
            <div className="h-full flex flex-col">
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
                  {(activeArtifact.type === 'html' || activeArtifact.type === 'js') && (
                    <button
                      onClick={() => handleRunCode(activeArtifact)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      title="Code ausführen"
                    >
                      <Play size={14} />
                      Ausführen
                    </button>
                  )}
                </div>
              </div>

              {/* Code Display - Toggle für HTML */}
              {showCode && (
                <div className={cn(
                  "overflow-auto p-6",
                  activeArtifact.type === 'html' ? "h-1/3" : "flex-1"
                )}>
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                    <code>{activeArtifact.content}</code>
                  </pre>
                </div>
              )}

              {/* Preview for HTML - Vollbild wenn Code ausgeblendet */}
              {activeArtifact.type === 'html' && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      HTML Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                      >
                        {showCode ? <Play size={14} /> : <Code size={14} />}
                        {showCode ? 'Nur Preview' : 'Code anzeigen'}
                      </button>
                      <button
                        onClick={() => handleRunCode(activeArtifact)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <ExternalLink size={14} />
                        In neuem Tab öffnen
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    {/* iframe Preview - Dynamische Höhe */}
                    <iframe
                      srcDoc={activeArtifact.content}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
                      style={{ 
                        height: showCode ? '500px' : 'calc(100vh - 300px)',
                        minHeight: '400px',
                        maxHeight: '800px'
                      }}
                      title="HTML Preview"
                      sandbox="allow-scripts allow-same-origin"
                      onLoad={(e) => {
                        console.log('HTML Preview iframe loaded');
                        // Dynamische Höhenanpassung basierend auf Inhalt
                        const iframe = e.target as HTMLIFrameElement;
                        try {
                          iframe.onload = () => {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            if (iframeDoc) {
                              const bodyHeight = iframeDoc.body.scrollHeight;
                              const newHeight = Math.max(400, Math.min(800, bodyHeight + 50));
                              iframe.style.height = `${newHeight}px`;
                            }
                          };
                        } catch (error) {
                          console.log('Höhenanpassung nicht möglich (Cross-Origin)');
                        }
                      }}
                      onError={(e) => {
                        console.error('HTML Preview iframe error:', e);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 