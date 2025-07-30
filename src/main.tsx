import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { ChatInterface } from './components/ChatInterface';
import { SettingsProvider } from './context/SettingsContext';

// Funktion, um zu prüfen, ob wir in Electron laufen
const isElectron = () => {
  return window.electronAPI !== undefined;
};

// Komponente, die Electron-spezifische Einstellungen vornimmt
const ElectronSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (isElectron()) {
      // Füge Electron-spezifische Klasse zum Body hinzu
      document.body.classList.add('electron-app');
      console.log('Running in Electron - applied electron-app class to body');
    }
  }, []);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ElectronSetup>
        <div className="app">
          <ChatInterface />
        </div>
      </ElectronSetup>
    </SettingsProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

