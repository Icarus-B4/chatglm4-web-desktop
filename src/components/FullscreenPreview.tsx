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
        console.log('JavaScript-Code ausführen:', artifact.content);
        alert('JavaScript-Code-Ausführung wird in einer zukünftigen Version unterstützt.');
      } catch (error) {
        console.error('Fehler beim Ausführen des JavaScript-Codes:', error);
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