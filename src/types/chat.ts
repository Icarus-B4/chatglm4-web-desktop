export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallResult {
  toolCallId: string;
  output: string;
  error?: string;
}

export interface CodeArtifact {
  id: string;
  type: 'html' | 'css' | 'js' | 'canvas';
  content: string;
  filename: string;
  language: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  thinking?: string;
  toolCalls?: ToolCall[];
  toolCallResults?: ToolCallResult[];
  codeArtifacts?: CodeArtifact[];
  searchResults?: Array<{
    type: 'code' | 'documentation';
    title: string;
    url: string;
    description: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingMessage {
  id: string;
  content: string;
  role: 'assistant';
  isComplete: boolean;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface WebSocketMessage {
  type: 'message' | 'stream_start' | 'stream_chunk' | 'stream_end' | 'error';
  data: any;
  messageId?: string;
}

// GLM-4.5 Model Variants
export type GLMModel = 'glm-4.5-chat' | 'glm-4.5-long' | 'glm-4.5-air' | 'glm-4.5-flash';

// GLM Modes
export type GLMMode = 'thinking' | 'non-thinking';

// Theme options
export type Theme = 'light' | 'dark' | 'auto';

// Application Settings
export interface AppSettings {
  model: GLMModel;
  mode: GLMMode;
  theme: Theme;
  chatBackgroundTransparency: number; // 0-100
  windowTransparency: number; // 0-100, nur für Electron-Desktop-App
  fontSize: 'small' | 'medium' | 'large';
  language: 'de' | 'en' | 'zh';
  autoScroll: boolean;
  soundEnabled: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
}

// Settings Context
export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

// Electron API Types
declare global {
  interface Window {
    electronAPI?: {
      onNewChat: (callback: (event: any) => void) => void;
      onOpenSettings: (callback: (event: any) => void) => void;
      onShowAbout: (callback: (event: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      appVersion: string;
      openFile: () => Promise<string>;
      saveFile: (data: string) => Promise<string>;
      showNotification: (title: string, body: string) => Promise<void>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      getSystemTheme: () => Promise<string>;
      onThemeChange: (callback: (event: any) => void) => void;
      setWindowOpacity: (opacity: number) => void; // Neue Methode für Fenster-Transparenz
      isElectron: boolean; // Erkennung, ob wir in Electron laufen
    };
  }
}
