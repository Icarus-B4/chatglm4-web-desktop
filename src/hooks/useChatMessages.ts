import { useState, useCallback } from 'react';
import { Message, CodeArtifact, ToolCall, ToolCallResult } from '../types/chat';
import { generateCodeWithClaude, extractCodeArtifactsFromClaude } from '../services/claudeCodeService';
import { API_CONFIG } from '../config/api';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Claude Code Integration - Für komplexe Code-Generierung
      if (content.toLowerCase().includes('claude') || 
          content.toLowerCase().includes('erstelle') ||
          content.toLowerCase().includes('entwickle') ||
          content.toLowerCase().includes('baue') ||
          content.toLowerCase().includes('programmiere')) {
        
        console.log('Claude Code Simulation wird verwendet für erweiterte Code-Generierung...');
        
        const claudeResult = await generateCodeWithClaude(content);
        
        if (claudeResult.success) {
          const codeArtifacts = extractCodeArtifactsFromClaude(claudeResult.messages);
          
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            content: `🤖 **Claude Code Generierung abgeschlossen!**

Ich habe dein Projekt mit Claude Code SDK erstellt. Das System hat ${claudeResult.messages.length} Nachrichten verarbeitet und ${codeArtifacts.length} Code-Artefakte generiert.

✨ **Generierte Dateien:**
${codeArtifacts.map((artifact, i) => `${i + 1}. **${artifact.filename}** (${artifact.language})`).join('\n')}

🚀 **Klicke auf "In isolierter Umgebung öffnen"** um das Projekt live zu testen!

**Claude Code Features verwendet:**
- Automatische Projektstruktur-Erstellung
- Intelligente Abhängigkeits-Verwaltung  
- Best-Practice Code-Generierung
- Cross-Platform Kompatibilität`,
            role: 'assistant',
            timestamp: new Date(),
            thinking: `Claude Code SDK hat erfolgreich ein Projekt basierend auf dem Prompt "${content}" erstellt. ${claudeResult.messages.length} Nachrichten wurden verarbeitet.`,
            codeArtifacts: codeArtifacts
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        } else {
          console.error(`Claude Code Fehler: ${claudeResult.error}`);
          // Fallback zur Demo-Version
        }
      }

      // Demo und Fallback: Code-Artifacts für Test-Zwecke 
      if (content.toLowerCase().includes('demo') || 
          content.toLowerCase().includes('next.js') || 
          content.toLowerCase().includes('nextjs') || 
          content.toLowerCase().includes('landing page') ||
          content.toLowerCase().includes('bild') ||
          content.toLowerCase().includes('upload')) {
        // Simuliere API-Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoCodeArtifacts: CodeArtifact[] = [
          {
            id: crypto.randomUUID(),
            type: 'js',
            content: `{
  "name": "nextjs-bild-upload-landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3"
  }
}`,
            filename: 'package.json',
            language: 'json'
          },
          {
            id: crypto.randomUUID(),
            type: 'js',
            content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
            filename: 'tailwind.config.js',
            language: 'javascript'
          },
          {
            id: crypto.randomUUID(),
            type: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

.upload-area {
            transition: all 0.3s ease;
        }

.upload-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.upload-area.dragover {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}`,
            filename: 'app/globals.css',
            language: 'css'
          },
          {
            id: crypto.randomUUID(),
            type: 'js',
            content: `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bild Upload Landing Page',
  description: 'Eine moderne Landing Page mit Bild-Upload-Funktionalität',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
            filename: 'app/layout.tsx',
            language: 'typescript'
          },
          {
            id: crypto.randomUUID(),
            type: 'js',
            content: `'use client'

import { useState } from 'react'
import { Upload, Camera, X, Download } from 'lucide-react'

interface UploadedImage {
  id: string
  name: string
  url: string
  size: number
}

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    // Simuliere Upload für Demo
    setTimeout(() => {
      const newImages = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size
      }))
      
      setUploadedImages(prev => [...prev, ...newImages])
      setIsUploading(false)
    }, 1500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Willkommen zur <span className="text-blue-600">Bild-Upload</span> Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Lade deine Bilder einfach und sicher hoch. Drag & Drop oder klicke zum Auswählen.
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-4xl mx-auto mb-12">
          <div
            className={\`upload-area border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 \${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }\`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mb-6">
              <Camera className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Bilder hier ablegen
              </h3>
              <p className="text-gray-600">
                oder klicke hier zum Auswählen
              </p>
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isUploading ? 'Uploading...' : 'Dateien auswählen'}
            </label>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        {uploadedImages.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Hochgeladene Bilder ({uploadedImages.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploadedImages.map((image) => (
                <div key={image.id} className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <button
                          onClick={() => removeImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <a
                          href={image.url}
                          download={image.name}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{image.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Warum unsere Platform wählen?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Einfacher Upload</h3>
              <p className="text-gray-600">
                Drag & Drop oder einfach klicken - so einfach war Bilder hochladen noch nie.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hohe Qualität</h3>
              <p className="text-gray-600">
                Deine Bilder werden in bester Qualität gespeichert und optimiert.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Schneller Zugriff</h3>
              <p className="text-gray-600">
                Lade deine Bilder jederzeit schnell und einfach wieder herunter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Bild-Upload Platform</h3>
          <p className="text-gray-400 mb-4">
            Die beste Lösung für deine Bild-Upload-Bedürfnisse
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 Bild-Upload Platform. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </main>
  )
}`,
            filename: 'app/page.tsx',
            language: 'typescript'
          }
        ];

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: `🚀 **Next.js Bild-Upload Landing Page erstellt!**

Ich habe eine vollständige, moderne Landing Page mit Bild-Upload-Funktionalität für dich erstellt:

📦 **Dateien:**
1. **package.json** - Next.js 14 Dependencies
2. **tailwind.config.js** - Tailwind CSS Konfiguration  
3. **app/globals.css** - Globale Styles mit Upload-Animationen
4. **app/layout.tsx** - Root Layout mit Metadaten
5. **app/page.tsx** - Hauptseite mit Drag & Drop Upload

✨ **Features:**
- Drag & Drop Bild-Upload
- Live-Vorschau hochgeladener Bilder
- Responsive Design mit Tailwind CSS
- Animierte Upload-Area
- Bildergalerie mit Hover-Effekten
- Modern Hero-Section mit Features

🎯 **Klicke auf "In isolierter Umgebung öffnen"** um die Landing Page live zu testen!`,
          role: 'assistant',
          timestamp: new Date(),
          thinking: "Der Benutzer hat nach Code gefragt. Ich erstelle Demo-Code-Artifacts mit HTML und JavaScript, um die Funktionalität zu demonstrieren. Die HTML-Datei zeigt eine schöne Webseite, die JavaScript-Datei enthält eine Demo-Klasse mit ChatGLM-Features.",
          codeArtifacts: demoCodeArtifacts,
          toolCalls: [
            {
              id: crypto.randomUUID(),
              type: "function",
              function: {
                name: "create_code_artifact",
                arguments: JSON.stringify({
                  filename: "demo.html",
                  language: "html",
                  content: demoCodeArtifacts[0].content
                })
              }
            },
            {
              id: crypto.randomUUID(),
              type: "function", 
              function: {
                name: "create_code_artifact",
                arguments: JSON.stringify({
                  filename: "demo.js",
                  language: "javascript",
                  content: demoCodeArtifacts[1].content
                })
              }
            }
          ]
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Direkte Z.AI API-Integration
      console.log('Sending request to:', `${API_CONFIG.BASE_URL}/chat/completions`);
      console.log('Using API Key:', API_CONFIG.API_KEY.substring(0, 10) + '...');
      
      // Timeout-Controller für API-Calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 Sekunden Timeout
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: API_CONFIG.MODEL,
          messages: [
            {
              role: 'system',
              content: `Du bist ein Experte für Webentwicklung und Programmierung. Wenn der User nach Code, Webseiten, Apps oder Projekten fragt, erstelle immer vollständige, funktionsfähige Code-Artefakte.

Wichtige Regeln:
- Erstelle IMMER eine package.json für Node.js/React/Next.js Projekte
- Füge alle notwendigen Dependencies hinzu
- Erstelle vollständige Dateien, nicht nur Snippets  
- Für Webseiten: HTML, CSS, JS separat oder als vollständige HTML-Datei
- Für React/Next.js: Komponenten, Konfigurationsdateien, etc.
- Nutze moderne Standards und Best Practices
- Deutsche Kommentare und Texte

Verwende das create_code_artifact Tool für jede Datei. Erstelle immer vollständige, funktionsfähige Dateien.

WICHTIG: Nutze NUR das create_code_artifact Tool - andere Tools können ignoriert werden.`
            },
            {
              role: 'user',
              content: content.trim(),
            },
          ],
          max_tokens: API_CONFIG.MAX_TOKENS,
          temperature: API_CONFIG.TEMPERATURE,
          stream: false,
          // Zusätzliche Parameter für erweiterte Funktionen
          tools: [
            {
              type: "function",
              function: {
                name: "create_code_artifact",
                description: "Erstellt ein Code-Artifact für verschiedene Programmiersprachen und Dateitypen. Verwende dieses Tool für jede Datei in einem Projekt.",
                parameters: {
                  type: "object",
                  properties: {
                    filename: {
                      type: "string",
                      description: "Name der Datei mit Pfad falls nötig (z.B. package.json, src/App.js, styles/main.css)"
                    },
                    language: {
                      type: "string",
                      description: "Dateityp/Sprache: html, css, js, jsx, ts, tsx, json, md, yaml, etc."
                    },
                    content: {
                      type: "string",
                      description: "Der vollständige Dateiinhalt - immer komplett, nie gekürzt"
                    },
                    description: {
                      type: "string",
                      description: "Kurze Beschreibung was diese Datei macht"
                    }
                  },
                  required: ["filename", "language", "content"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "create_project_structure",
                description: "Beschreibt die Struktur eines erstellten Projekts",
                parameters: {
                  type: "object",
                  properties: {
                    project_type: {
                      type: "string",
                      description: "Art des Projekts (React, Next.js, Vanilla HTML, Node.js, etc.)"
                    },
                    install_command: {
                      type: "string", 
                      description: "Befehl zum Installieren (npm install, yarn install, etc.)"
                    },
                    start_command: {
                      type: "string",
                      description: "Befehl zum Starten (npm start, npm run dev, etc.)"
                    },
                    port: {
                      type: "number",
                      description: "Port auf dem die App läuft (3000, 8080, etc.)"
                    }
                  },
                  required: ["project_type", "install_command", "start_command"]
                }
              }
            }
          ],
          tool_choice: "auto"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`API-Fehler: ${response.status} - ${errorText}`);
      }

      clearTimeout(timeoutId); // Timeout aufheben wenn Antwort da ist
      const data = await response.json();
        
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: data.choices[0].message.content,
          role: 'assistant',
          timestamp: new Date(),
          // Denkprozess simulieren (falls verfügbar)
          thinking: data.choices[0].message.thinking || null,
          // Tool-Calls verarbeiten
          toolCalls: data.choices[0].message.tool_calls?.map((toolCall: any) => ({
            id: toolCall.id,
            type: toolCall.type,
            function: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments
            }
          })) || [],
          // Code-Artifacts aus Tool-Calls extrahieren
          codeArtifacts: data.choices[0].message.tool_calls?.map((toolCall: any) => {
            if (toolCall.function.name === 'create_code_artifact') {
              try {
              const args = JSON.parse(toolCall.function.arguments);
                
                // Validiere notwendige Felder
                if (!args.content || !args.filename) {
                  console.warn('Unvollständiger Code-Artifact:', args);
                  return null;
                }
                
                // Erweiterte Zuordnung von Sprachen zu Typen
                let artifactType: 'html' | 'css' | 'js' | 'canvas' = 'js';
                const lang = (args.language || 'js').toLowerCase();
                
                if (['html', 'htm'].includes(lang)) artifactType = 'html';
                else if (['css', 'scss', 'sass', 'less'].includes(lang)) artifactType = 'css';
                else if (['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(lang)) artifactType = 'js';
                else if (lang === 'canvas') artifactType = 'canvas';
                else artifactType = 'js'; // Default für JSON, MD, etc.
                
              return {
                id: crypto.randomUUID(),
                  type: artifactType,
                content: args.content,
                filename: args.filename,
                  language: args.language || 'js'
              } as CodeArtifact;
              } catch (parseError) {
                console.error('Fehler beim Parsen der Tool-Arguments:', parseError);
                return null;
              }
            }
            return null;
          }).filter(Boolean) || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Ungültige API-Antwort');
      }
    } catch (error) {
      console.error('ChatGLM API Fehler:', error);
      
      let errorMessage = 'Unbekannter Fehler';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Verbindungsfehler: Kann GLM-4 API nicht erreichen. Prüfe deine Internetverbindung.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Fallback: Fehlermeldung bei API-Fehler mit Recovery-Option
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: `❌ **Fehler bei der Code-Generierung:**

${errorMessage}

**Mögliche Lösungen:**
- Prüfe deinen API-Key in der .env Datei
- Stelle sicher, dass du eine stabile Internetverbindung hast
- Versuche es in ein paar Sekunden erneut
- Bei wiederholten Problemen: Verwende einen einfacheren Prompt

**Für Tests:** Schreibe "demo code" um die Demo-Funktionalität zu verwenden.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}; 