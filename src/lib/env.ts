// Definiere die Umgebungsvariablen für die Browser-Umgebung
declare global {
  interface Window {
    __ENV__: {
      DAYTONA_API_KEY?: string;
      DAYTONA_API_URL?: string;
      DAYTONA_TARGET?: string;
      DAYTONA_ORGANIZATION_ID?: string;
      NODE_ENV?: string;
      [key: string]: string | undefined;
    };
  }
}

// Initialisiere die Umgebungsvariablen
if (typeof window !== 'undefined') {
  window.__ENV__ = {
    DAYTONA_API_KEY: import.meta.env.VITE_DAYTONA_API_KEY,
    DAYTONA_API_URL: import.meta.env.VITE_DAYTONA_API_URL || 'https://api.daytona.io/v1',
    DAYTONA_TARGET: import.meta.env.VITE_DAYTONA_TARGET || 'us',
    DAYTONA_ORGANIZATION_ID: import.meta.env.VITE_DAYTONA_ORGANIZATION_ID,
    NODE_ENV: import.meta.env.MODE
  };
}

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    return window.__ENV__?.[key] || defaultValue;
  }
  return defaultValue;
}; 