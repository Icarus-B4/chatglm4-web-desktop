// Browser-kompatible Claude Code Alternative
// Da die originale Claude Code SDK Node.js-spezifisch ist

import { API_CONFIG } from '../config/api';
import { CodeArtifact } from '../types/chat';

interface SDKMessage {
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface CodeGenerationResult {
  success: boolean;
  messages: SDKMessage[];
  error?: string;
}

export async function generateCodeWithClaude(prompt: string): Promise<CodeGenerationResult> {
  try {
    console.log('Starte Code-Generierung mit Z.AI API...');

    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: `Du bist ein Experte für Webentwicklung und Programmierung. Wenn der User nach Code, Webseiten, Apps oder Projekten fragt, erstelle immer vollständige, funktionsfähige Code-Artefakte.

Wichtige Regeln:
- Für einfache Webseiten/HTML: Erstelle eine EINZELNE HTML-Datei mit inline CSS im <style> Tag und inline JavaScript im <script> Tag - KEINE externen Dateien!
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
            content: prompt,
          },
        ],
        max_tokens: API_CONFIG.MAX_TOKENS,
        temperature: API_CONFIG.TEMPERATURE,
        stream: false,
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

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
            success: true,
            messages: [data.choices[0].message],
        };
    } else {
        return {
            success: false,
            messages: [],
            error: 'Ungültige API-Antwortstruktur'
        }
    }

  } catch (error: any) {
    console.error("Error generating code:", error);
    return {
      success: false,
      messages: [],
      error: error.message
    };
  }
}

// Erweiterte Artifact-Extraktion die verschiedene Message-Formate unterstützt
export function extractCodeArtifactsFromClaude(messages: any[]): CodeArtifact[] {
    const artifacts: CodeArtifact[] = [];
    
    console.log('🔍 Extrahiere Artifacts aus', messages.length, 'Nachrichten');
  
    messages.forEach((message, index) => {
      console.log(`📨 Message ${index}:`, { type: message?.type, role: message?.role, hasToolCalls: !!message?.tool_calls });
      
      // Format 1: Standard tool_calls Format (von Z.AI API)
      if (message.tool_calls && Array.isArray(message.tool_calls)) {
        message.tool_calls.forEach((toolCall: any) => {
          if (toolCall.function && toolCall.function.name === 'create_code_artifact') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const artifact = createArtifactFromArgs(args, 'tool_calls');
              if (artifact) {
                artifacts.push(artifact);
                console.log('✅ Artifact extrahiert (tool_calls):', artifact.filename);
              }
            } catch (parseError) {
              console.error('❌ Fehler beim Parsen der Tool-Arguments:', parseError);
            }
          }
        });
      }
      
      // Format 2: Claude Code SDK Format (tool_use messages)
      if (message.type === 'tool_use' && message.name === 'create_code_artifact') {
        const artifact = createArtifactFromArgs(message.input || message.parameters, 'tool_use');
        if (artifact) {
          artifacts.push(artifact);
          console.log('✅ Artifact extrahiert (tool_use):', artifact.filename);
        }
      }
      
      // Format 3: Write/Edit Format (legacy Claude Code)
      if (message.type === 'tool_use' && (message.name === 'Write' || message.name === 'Edit')) {
        const input = message.input;
        if (input?.file_path && input?.content) {
          const fileExtension = input.file_path.split('.').pop()?.toLowerCase();
          const artifact = {
            id: crypto.randomUUID(),
            type: determineArtifactType(fileExtension || ''),
            content: input.content,
            filename: input.file_path.split('/').pop() || `file-${index}`,
            language: fileExtension || 'text'
          } as CodeArtifact;
          
          artifacts.push(artifact);
          console.log('✅ Artifact extrahiert (Write/Edit):', artifact.filename);
        }
      }
    });
    
console.log('🎯 Gesamt extrahierte Artifacts:', artifacts.length);
    console.log('--- GENERIERTE ARTEFAKTE FÜR TEST ---');
    console.log(JSON.stringify(artifacts, null, 2));
    console.log('--- ENDE GENERIERTE ARTEFAKTE ---');
    return artifacts;
}

// Hilfsfunktion zum Erstellen von Artifacts aus Argumenten
function createArtifactFromArgs(args: any, source: string): CodeArtifact | null {
  if (!args || !args.content || !args.filename) {
    console.warn(`⚠️ Unvollständiger Code-Artifact (${source}):`, args);
    return null;
  }
  
  const artifactType = determineArtifactType(args.language || '');
  
  return {
    id: crypto.randomUUID(),
    type: artifactType,
    content: args.content,
    filename: args.filename,
    language: args.language || 'js'
  };
}

// Hilfsfunktion zur Bestimmung des Artifact-Typs
function determineArtifactType(language: string): 'html' | 'css' | 'js' | 'canvas' {
  const lang = language.toLowerCase();
  
  if (['html', 'htm'].includes(lang)) return 'html';
  else if (['css', 'scss', 'sass', 'less'].includes(lang)) return 'css';
  else if (['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(lang)) return 'js';
  else if (lang === 'canvas') return 'canvas';
  else if (['json', 'md', 'yaml', 'yml', 'txt'].includes(lang)) return 'js'; // Default für Textdateien
  else return 'js'; // Default
}
