import React from 'react';
import { X, Minus, Square } from 'lucide-react';

interface ElectronTitleBarProps {
  title?: string;
}

export const ElectronTitleBar: React.FC<ElectronTitleBarProps> = ({ title = 'ChatGLM Desktop' }) => {
  // Prüfen, ob wir in Electron laufen
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

  if (!isElectron) {
    return null; // Nicht anzeigen, wenn nicht in Electron
  }

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  return (
    <div className="electron-titlebar flex items-center justify-between h-10 bg-gray-900/95 backdrop-blur-lg px-4 select-none border-b border-gray-700/50">
      <div className="titlebar-drag-region flex-1 h-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex items-center h-full">
          <span className="text-sm font-medium ml-2 text-white/90">{title}</span>
        </div>
      </div>
      <div className="titlebar-controls flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button 
          onClick={handleMinimize}
          className="titlebar-button flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={handleMaximize}
          className="titlebar-button flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <Square size={14} />
        </button>
        <button 
          onClick={handleClose}
          className="titlebar-button flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-500 text-white/70 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}; 