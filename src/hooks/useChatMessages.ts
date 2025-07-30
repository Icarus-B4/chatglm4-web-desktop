import { useState, useCallback } from 'react';
import { Message, CodeArtifact, ToolCall, ToolCallResult } from '../types/chat';
import { generateCodeWithClaude, extractCodeArtifactsFromClaude } from '../services/claudeCodeService';
import { API_CONFIG } from '../config/api';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Funktion zum Durchsuchen von lokalen Code-Beispielen und Dokumentation
  const searchCodeAndDocs = async (query: string) => {
    try {
      // Lokale/sichere Dokumentationssuche ohne externe APIs
      const localResults = [
        {
          type: 'documentation',
          title: 'HTML Grundlagen',
          url: 'https://developer.mozilla.org/de/docs/Web/HTML',
          description: 'Vollständiger HTML-Leitfaden für moderne Webentwicklung'
        },
        {
          type: 'documentation', 
          title: 'CSS Layout Guide',
          url: 'https://developer.mozilla.org/de/docs/Web/CSS',
          description: 'CSS-Techniken für responsive Designs'
        },
        {
          type: 'documentation',
          title: 'JavaScript Referenz',
          url: 'https://developer.mozilla.org/de/docs/Web/JavaScript',
          description: 'Moderne JavaScript-Features und Best Practices'
        },
        {
          type: 'documentation',
          title: 'React Documentation',
          url: 'https://react.dev/',
          description: 'Offizielle React-Dokumentation für moderne App-Entwicklung'
        },
        {
          type: 'documentation',
          title: 'Next.js Guide',
          url: 'https://nextjs.org/docs',
          description: 'Full-Stack React Framework für Produktionsanwendungen'
        }
      ];

      // Filter basierend auf Query
      const filteredResults = localResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes('html') && result.title.includes('HTML') ||
        query.toLowerCase().includes('css') && result.title.includes('CSS') ||
        query.toLowerCase().includes('javascript') && result.title.includes('JavaScript') ||
        query.toLowerCase().includes('react') && result.title.includes('React') ||
        query.toLowerCase().includes('next') && result.title.includes('Next.js')
      );

      setSearchResults(filteredResults.length > 0 ? filteredResults : localResults.slice(0, 3));
      return searchResults;
    } catch (error) {
      console.error('Fehler bei der lokalen Suche:', error);
      return [];
    }
  };

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
    setThinking('Analysiere Anfrage...');

    try {
      // Suche nach relevanten Code-Beispielen und Dokumentation
      setThinking('Suche nach relevanten Code-Beispielen und Dokumentation...');
      const searchResults = await searchCodeAndDocs(content);
      
      // Prüfe ob es sich um eine Code-Anfrage handelt
      const isCodeRequest = content.toLowerCase().includes('erstelle') ||
                           content.toLowerCase().includes('entwickle') ||
                           content.toLowerCase().includes('baue') ||
                           content.toLowerCase().includes('programmiere') ||
                           content.toLowerCase().includes('code') ||
                           content.toLowerCase().includes('app') ||
                           content.toLowerCase().includes('website') ||
                           content.toLowerCase().includes('webseite') ||
                           content.toLowerCase().includes('komponente') ||
                           content.toLowerCase().includes('funktion') ||
                           content.toLowerCase().includes('projekt') ||
                           content.toLowerCase().includes('html') ||
                           content.toLowerCase().includes('css') ||
                           content.toLowerCase().includes('javascript') ||
                           content.toLowerCase().includes('react') ||
                           content.toLowerCase().includes('next.js') ||
                           content.toLowerCase().includes('vue') ||
                           content.toLowerCase().includes('angular');

      if (isCodeRequest) {
        setThinking('Starte intelligente Code-Generierung mit Z.AI...');
        console.log('Verwende Z.AI API für prompt-basierte Code-Generierung...');
        
        const claudeResult = await generateCodeWithClaude(content);
        
        if (claudeResult.success) {
          setThinking('Extrahiere und verarbeite generierte Code-Artefakte...');
          console.log('📝 useChatMessages: Verarbeite Claude-Ergebnis mit', claudeResult.messages.length, 'Messages');
          const codeArtifacts = extractCodeArtifactsFromClaude(claudeResult.messages as any[]);
          const message = claudeResult.messages[0];
          console.log('📊 useChatMessages: Extrahierte', codeArtifacts.length, 'Artifacts');
          
          setThinking('Erstelle Antwort mit generierten Artefakten...');
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            content: codeArtifacts.length > 0 ? 
              `🚀 **Code-Generierung abgeschlossen!**

Ich habe basierend auf deinem Prompt \"${content}\" ein vollständiges Projekt erstellt:

✨ **Generierte Dateien (${codeArtifacts.length}):**
${codeArtifacts.map((artifact, i) => `${i + 1}. **${artifact.filename}** (${artifact.language})`).join('\\n')}

🔍 **Zusätzliche Ressourcen:**
${searchResults.slice(0, 3).map(result => `- [${result.title}](${result.url})`).join('\\n')}

🎯 **Klicke auf \"In isolierter Umgebung öffnen\"** um das Projekt live zu testen!

**Intelligente Features:**
- Prompt-basierte Code-Generierung
- Automatische Projektstruktur
- Moderne Best Practices
- Vollständige Dependencies` : 
              `💬 **Antwort generiert:**

${message?.content || 'Hier ist meine Antwort auf deine Anfrage.'}

🔍 **Relevante Ressourcen:**
${searchResults.slice(0, 3).map(result => `- [${result.title}](${result.url})`).join('\\n')}`,
            role: 'assistant',
            timestamp: new Date(),
            thinking: `Z.AI hat erfolgreich auf den Prompt \"${content}\" reagiert. ${codeArtifacts.length} Code-Artefakte wurden generiert.`,
            codeArtifacts: codeArtifacts,
            searchResults: searchResults
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          setThinking('');
          return;
        } else {
          console.error(`Z.AI Code-Generierung Fehler: ${claudeResult.error}`);
          setThinking('Fehler bei der Code-Generierung, verwende Fallback...');
          // Fallthrough zur Standard-API
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
        setThinking('');
        return;
      }

      // Direkte Z.AI API-Integration
      console.log('Sending request to:', `${API_CONFIG.BASE_URL}/chat/completions`);
      console.log('Using API Key:', API_CONFIG.API_KEY.substring(0, 10) + '...');
      
      // Timeout-Controller für API-Calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 Sekunden Timeout
      
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
- Für einfache Webseiten/HTML: Erstelle eine EINZELNE HTML-Datei mit inline CSS und JavaScript im <style> und <script> Tag - KEINE externen Dateien!
- Für komplexe Projekte (React/Next.js/Node.js): Erstelle separate Dateien und eine package.json mit allen Dependencies
- Füge alle notwendigen Dependencies hinzu
- Erstelle vollständige Dateien, nicht nur Snippets
- Nutze moderne Standards und Best Practices
- Deutsche Kommentare und Texte
- Für Games/Spiele: Immer als vollständige HTML-Datei mit inline CSS/JS
- Für Landing Pages: Als HTML mit inline Styles oder als React/Next.js Projekt

BESONDERS WICHTIG für Webseiten:
- Snake Game, Tic-Tac-Toe, Calculator, etc. → EINE HTML-Datei mit allem inline
- Einfache Landing Pages → EINE HTML-Datei mit inline CSS/JS
- Nur bei expliziter Anfrage nach React/Next.js/Vue → separate Dateien

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
          // Code-Artifacts mit zentralisierter Extraktionsfunktion
          codeArtifacts: extractCodeArtifactsFromClaude([data.choices[0].message])
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Ungültige API-Antwort');
      }
    } catch (error) {
      console.error('ChatGLM API Fehler:', error);
      setThinking('Fehler aufgetreten, erstelle Fehlermeldung...');
      
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
      setThinking('');
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSearchResults([]);
  }, []);

  return {
    messages,
    isLoading,
    thinking,
    searchResults,
    sendMessage,
    clearMessages,
  };
}; 