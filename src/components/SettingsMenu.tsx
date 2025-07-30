import React from 'react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { Settings, Palette, Monitor, Cpu, Volume2, Type, Globe, RotateCcw, LogIn } from 'lucide-react';

export const SettingsMenu: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useSettings();

  if (!isSettingsOpen) return null;

  const modelDescriptions = {
    'glm-4.5-chat': 'Standard Chat-Modell für allgemeine Unterhaltungen',
    'glm-4.5-long': 'Erweiterte Kontextlänge für komplexe Aufgaben',
    'glm-4.5-air': 'Leichtgewichtiges Modell für schnelle Antworten',
    'glm-4.5-flash': 'Ultraschnelles Modell für sofortige Reaktionen'
  };

  const handleSave = () => {
    // Settings werden automatisch gespeichert, nur Dialog schließen
    setIsSettingsOpen(false);
  };

  const handleLogin = () => {
    // Login-Funktionalität implementieren
    console.log('Login clicked');
    alert('Login-Funktionalität wird implementiert...');
    // Hier könnte die Login-Logik hinzugefügt werden
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsSettingsOpen(false)}
      >
        {/* Settings Modal */}
        <div 
          className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Einstellungen</h2>
            </div>
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Settings Content */}
          <div className="p-6 space-y-8">
            {/* Model Selection */}
            <div className="settings-section">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Modellauswahl</h3>
              </div>
              <div className="space-y-3">
                <label htmlFor="model" className="block text-sm font-medium text-muted-foreground">
                  GLM-4.5 Variante
                </label>
                <select
                  id="model"
                  value={settings.model}
                  onChange={(e) => {
                    const model = e.target.value as typeof settings.model;
                    updateSettings({ model });
                    console.log('Switched to model:', model);
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg border border-input bg-background",
                    "text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    "transition-all duration-200"
                  )}
                >
                  <option value="glm-4.5-chat">GLM-4.5 Chat</option>
                  <option value="glm-4.5-long">GLM-4.5 Long</option>
                  <option value="glm-4.5-air">GLM-4.5 Air</option>
                  <option value="glm-4.5-flash">GLM-4.5 Flash</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  {modelDescriptions[settings.model]}
                </p>
              </div>
            </div>

            {/* GLM Mode */}
            <div className="settings-section">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">GLM-Modus</h3>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground">
                  Antwortmodus
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      updateSettings({ mode: 'thinking' });
                      console.log('Switched to thinking mode');
                    }}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all duration-200",
                      settings.mode === 'thinking'
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background hover:bg-accent"
                    )}
                  >
                    <div className="font-medium mb-1">Thinking</div>
                    <div className="text-sm text-muted-foreground">
                      Zeigt Denkprozesse
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      updateSettings({ mode: 'non-thinking' });
                      console.log('Switched to non-thinking mode');
                    }}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all duration-200",
                      settings.mode === 'non-thinking'
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background hover:bg-accent"
                    )}
                  >
                    <div className="font-medium mb-1">Non-Thinking</div>
                    <div className="text-sm text-muted-foreground">
                      Direkte Antworten
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="settings-section">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Erscheinungsbild</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        updateSettings({ theme: 'light' });
                        console.log('Switched to light theme');
                      }}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all duration-200",
                        settings.theme === 'light'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-accent"
                      )}
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-white border rounded-full"></div>
                      <div className="text-sm font-medium">Hell</div>
                    </button>
                    <button
                      onClick={() => {
                        updateSettings({ theme: 'dark' });
                        console.log('Switched to dark theme');
                      }}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all duration-200",
                        settings.theme === 'dark'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-accent"
                      )}
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-800 border rounded-full"></div>
                      <div className="text-sm font-medium">Dunkel</div>
                    </button>
                    <button
                      onClick={() => {
                        updateSettings({ theme: 'auto' });
                        console.log('Switched to auto theme');
                      }}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all duration-200",
                        settings.theme === 'auto'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-accent"
                      )}
                    >
                      <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-r from-white to-gray-800 border rounded-full"></div>
                      <div className="text-sm font-medium">Auto</div>
                    </button>
                  </div>
                </div>

                {/* Chat Background Transparency */}
                <div>
                  <label htmlFor="transparency" className="block text-sm font-medium text-muted-foreground mb-3">
                    Chat-Hintergrund Transparenz ({settings.chatBackgroundTransparency}%)
                  </label>
                  <div className="space-y-2">
                    <input
                      id="transparency"
                      type="range"
                      min="0"
                      max="100"
                      value={settings.chatBackgroundTransparency}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        updateSettings({ chatBackgroundTransparency: value });
                        console.log('Updated transparency to:', value);
                      }}
                      className={cn(
                        "w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
                        "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Transparent</span>
                      <span>Undurchsichtig</span>
                    </div>
                  </div>
                </div>

                {/* Window Transparency - nur für Electron */}
                {typeof window !== 'undefined' && window.electronAPI && (
                  <div>
                    <label htmlFor="window-transparency" className="block text-sm font-medium text-muted-foreground mb-3">
                      Fenster-Transparenz ({settings.windowTransparency}%)
                    </label>
                    <div className="space-y-2">
                      <input
                        id="window-transparency"
                        type="range"
                        min="50"
                        max="100"
                        value={settings.windowTransparency}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          updateSettings({ windowTransparency: value });
                          console.log('Updated window transparency to:', value);
                        }}
                        className={cn(
                          "w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer",
                          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
                          "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Transparent (50%)</span>
                        <span>Undurchsichtig</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nur für die Desktop-App verfügbar. Steuert die Transparenz des gesamten Fensters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="settings-section">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Weitere Optionen</h3>
              </div>
              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Schriftgröße
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          updateSettings({ fontSize: size });
                          console.log('Switched to font size:', size);
                        }}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all duration-200",
                          settings.fontSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-background hover:bg-accent"
                        )}
                      >
                        <div className={cn(
                          "font-medium",
                          size === 'small' && "text-sm",
                          size === 'medium' && "text-base",
                          size === 'large' && "text-lg"
                        )}>
                          {size === 'small' && 'Klein'}
                          {size === 'medium' && 'Mittel'}
                          {size === 'large' && 'Groß'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  {[
                    { key: 'autoScroll', label: 'Automatisches Scrollen', icon: Monitor },
                    { key: 'soundEnabled', label: 'Sound-Benachrichtigungen', icon: Volume2 },
                    { key: 'showTimestamps', label: 'Zeitstempel anzeigen', icon: Globe },
                    { key: 'compactMode', label: 'Kompakter Modus', icon: Type },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <button
                        onClick={() => {
                          updateSettings({ [key]: !settings[key as keyof typeof settings] });
                          console.log('Toggled', key, 'to', !settings[key as keyof typeof settings]);
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          settings[key as keyof typeof settings] ? "bg-primary" : "bg-input"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            settings[key as keyof typeof settings] ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <button
              onClick={resetSettings}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-destructive hover:bg-destructive/10 transition-colors"
              )}
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={cn(
                  "px-6 py-2 rounded-lg border border-input",
                  "hover:bg-accent transition-colors"
                )}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className={cn(
                  "px-6 py-2 rounded-lg bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

