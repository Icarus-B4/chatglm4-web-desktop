const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Bestehende Methoden
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  platform: process.platform,
  appVersion: process.env.npm_package_version || 'unknown',
  
  // Datei-Operationen
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // Benachrichtigungen
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // Fenster-Operationen
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  
  // Theme
  getSystemTheme: () => ipcRenderer.invoke('get-system-theme'),
  onThemeChange: (callback) => ipcRenderer.on('theme-changed', callback),
  
  // Neue Methode für Fenster-Transparenz
  setWindowOpacity: (opacity) => ipcRenderer.send('set-window-opacity', opacity),
  
  // Erkennung, ob wir in Electron oder im Browser laufen
  isElectron: true
});

console.log('Preload script loaded'); 