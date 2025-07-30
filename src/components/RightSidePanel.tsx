import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Code, Eye, Download, Copy, Play, Square, X, Maximize2, Minimize2 } from 'lucide-react';
import { CodeArtifact } from '../types/chat';
import { FullscreenPreview } from './FullscreenPreview';

interface RightSidePanelProps {
  artifacts: CodeArtifact[];
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidePanel: React.FC<RightSidePanelProps> = ({ artifacts, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [selectedArtifact, setSelectedArtifact] = useState<CodeArtifact | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    if (artifacts.length > 0 && !selectedArtifact) {
      setSelectedArtifact(artifacts[0]);
    }
  }, [artifacts, selectedArtifact]);

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelRef.current?.offsetWidth || 384;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const deltaX = startX.current - e.clientX;
    const newWidth = Math.max(300, Math.min(800, startWidth.current + deltaX));
    
    if (panelRef.current) {
      panelRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleCopyCode = async () => {
    if (selectedArtifact) {
      try {
        await navigator.clipboard.writeText(selectedArtifact.content);
        // TODO: Show success toast
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  const handleDownload = () => {
    if (selectedArtifact) {
      const blob = new Blob([selectedArtifact.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedArtifact.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePlayPreview = () => {
    if (previewRef.current && selectedArtifact) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(selectedArtifact.content);
        doc.close();
        setIsPlaying(true);
      }
    }
  };

  const handleStopPreview = () => {
    setIsPlaying(false);
  };

  const renderPreview = () => {
    if (!selectedArtifact) return null;

    if (selectedArtifact.type === 'canvas') {
      return (
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full border border-gray-300 rounded"
            width={800}
            height={600}
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={handlePlayPreview}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play size={16} />
              Canvas bearbeiten
            </button>
            <button
              onClick={handleStopPreview}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Square size={16} />
              Stoppen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 relative">
        <iframe
          ref={previewRef}
          className="w-full h-full rounded-lg"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setIsPreviewFullscreen(true)}
            className="p-2 bg-gray-800/50 text-white rounded-lg hover:bg-gray-800/70 transition-colors"
            title="Vollbild"
          >
            <Maximize2 size={16} />
          </button>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handlePlayPreview}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play size={16} />
              Vorschau starten
            </button>
            <button
              onClick={handleStopPreview}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Square size={16} />
              Stoppen
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCode = () => {
    if (!selectedArtifact) return null;

    return (
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Code size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-200">{selectedArtifact.filename}</span>
            <span className="text-xs text-gray-500">({selectedArtifact.language})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
            >
              <Copy size={12} />
              Kopieren
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>
        <div className="p-4">
          <pre className="text-sm text-gray-100 overflow-x-auto">
            <code>{selectedArtifact.content}</code>
          </pre>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className={cn(
        "fixed inset-y-0 right-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col transition-all duration-200",
        isExpanded ? "w-full" : "w-96"
      )}
      style={{ width: isExpanded ? '100%' : undefined }}
    >
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isExpanded ? "Panel verkleinern" : "Panel vergrößern"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Artifact Selector */}
      {artifacts.length > 1 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto">
            {artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  selectedArtifact?.id === artifact.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {artifact.filename}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeTab === 'preview'
                ? "bg-blue-500 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Eye size={14} className="inline mr-1" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeTab === 'code'
                ? "bg-blue-500 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Code size={14} className="inline mr-1" />
            Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === 'preview' ? renderPreview() : renderCode()}
      </div>

      {/* Fullscreen Preview */}
      {selectedArtifact && (
        <FullscreenPreview
          artifacts={artifacts}
          isOpen={isPreviewFullscreen}
          onClose={() => setIsPreviewFullscreen(false)}
        />
      )}
    </div>
  );
}; 