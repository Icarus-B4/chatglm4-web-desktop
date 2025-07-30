import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsContextType, AppSettings } from '../types/chat';

const SETTINGS_STORAGE_KEY = 'chatglm-settings';

const defaultSettings: AppSettings = {
  model: 'glm-4.5-chat',
  mode: 'thinking',
  theme: 'auto',
  chatBackgroundTransparency: 89,
  windowTransparency: 90, // Standard-Transparenz für das Electron-Fenster (90% statt 97%)
  fontSize: 'medium',
  language: 'de',
  autoScroll: true,
  soundEnabled: true,
  showTimestamps: true,
  compactMode: false,
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return defaultSettings;
};

// Save settings to localStorage
const saveSettings = (settings: AppSettings): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Apply theme changes to the document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      console.log('Applied dark theme');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      console.log('Applied light theme');
    } else if (settings.theme === 'auto') {
      // Auto theme: follow system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          root.classList.add('dark');
          console.log('Applied auto dark theme');
        } else {
          root.classList.remove('dark');
          console.log('Applied auto light theme');
        }
      };
      
      updateTheme(mediaQuery);
      mediaQuery.addEventListener('change', updateTheme);
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [settings.theme]);

  // Apply chat background transparency
  useEffect(() => {
    const root = window.document.documentElement;
    const opacity = (settings.chatBackgroundTransparency / 100).toString();
    root.style.setProperty('--chat-background-opacity', opacity);
    console.log('Applied chat background opacity:', opacity);
  }, [settings.chatBackgroundTransparency]);

  // Apply font size
  useEffect(() => {
    const root = window.document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    const fontSize = fontSizeMap[settings.fontSize];
    root.style.setProperty('--base-font-size', fontSize);
    console.log('Applied font size:', fontSize);
  }, [settings.fontSize]);

  // Apply window transparency (nur für Electron)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const opacity = settings.windowTransparency / 100;
      window.electronAPI.setWindowOpacity(opacity);
      console.log('Applied window transparency:', opacity);
    }
  }, [settings.windowTransparency]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, ...updates };
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isSettingsOpen, setIsSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
