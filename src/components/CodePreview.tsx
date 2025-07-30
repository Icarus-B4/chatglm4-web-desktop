import React from 'react';
import { cn } from '../lib/utils';
import { CodeArtifact } from '../types/chat';
import { X, Download, Copy, Play, ExternalLink } from 'lucide-react';

interface CodePreviewProps {
  artifacts: CodeArtifact[];
  isOpen: boolean;
  onClose: () => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ artifacts, isOpen, onClose }) => {
  const [activeArtifact, setActiveArtifact] = React.useState<CodeArtifact | null>(
    artifacts.length > 0 ? artifacts[0] : null
  );

  React.useEffect(() => {
    if (artifacts.length > 0 && !activeArtifact) {
      setActiveArtifact(artifacts[0]);
    }
  }, [artifacts, activeArtifact]);

  const handleCopyCode = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Hier könnte ein Toast-Notification hinzugefügt werden
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
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(artifact.content);
        newWindow.document.close();
      }
    } else if (artifact.type === 'js') {
      try {
        // Für JavaScript-Code - hier könnte ein Code-Editor oder Sandbox verwendet werden
        console.log('JavaScript-Code ausführen:', artifact.content);
        alert('JavaScript-Code-Ausführung wird in einer zukünftigen Version unterstützt.');
      } catch (error) {
        console.error('Fehler beim Ausführen des JavaScript-Codes:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Code Preview
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
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
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

              {/* Code Display */}
              <div className="flex-1 overflow-auto p-6">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
                  <code>{activeArtifact.content}</code>
                </pre>
              </div>

              {/* Preview for HTML */}
              {activeArtifact.type === 'html' && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      HTML Preview
                    </h3>
                    <button
                      onClick={() => handleRunCode(activeArtifact)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <ExternalLink size={14} />
                      In neuem Tab öffnen
                    </button>
                  </div>
                  <div className="p-4">
                    <iframe
                      srcDoc={activeArtifact.content}
                      className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg"
                      title="HTML Preview"
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