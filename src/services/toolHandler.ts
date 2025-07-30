// Tool Handler Service für Web-Search und andere Tools
import { CodeArtifact } from '../types/chat';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

// Web-Search Service URL
const WEB_SEARCH_SERVICE_URL = 'http://localhost:3004';

export async function handleToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  for (const toolCall of toolCalls) {
    console.log(`🔧 Verarbeite Tool-Call: ${toolCall.function.name}`);
    
    try {
      const args = JSON.parse(toolCall.function.arguments);
      
      switch (toolCall.function.name) {
        case 'web_search':
          const searchResult = await handleWebSearch(args.query);
          results.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: searchResult
          });
          break;
          
        case 'create_code_artifact':
          // Code-Artefakte werden bereits in extractCodeArtifactsFromClaude behandelt
          // Hier nur eine Bestätigung
          results.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: `Code-Artefakt "${args.filename}" erfolgreich erstellt.`
          });
          break;
          
        default:
          console.warn(`⚠️ Unbekanntes Tool: ${toolCall.function.name}`);
          results.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: `Tool "${toolCall.function.name}" ist nicht verfügbar.`
          });
      }
    } catch (error) {
      console.error(`❌ Fehler bei Tool-Call ${toolCall.function.name}:`, error);
      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        content: `Fehler beim Ausführen von "${toolCall.function.name}": ${error}`
      });
    }
  }

  return results;
}

async function handleWebSearch(query: string): Promise<string> {
  console.log(`🔍 Führe Web-Suche aus: "${query}"`);
  
  try {
    const response = await fetch(`${WEB_SEARCH_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Web-Search Service Fehler: ${response.status}`);
    }

    const searchResults = await response.json();
    
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      return `Keine Suchergebnisse für "${query}" gefunden.`;
    }

    // Formatiere Suchergebnisse für die KI
    const formattedResults = searchResults.slice(0, 5).map((result, index) => 
      `${index + 1}. **${result.title}**\n   URL: ${result.url}\n   ${result.snippet}\n`
    ).join('\n');

    const summary = `Web-Suche für "${query}" - ${searchResults.length} Ergebnisse gefunden:\n\n${formattedResults}`;
    
    console.log(`✅ Web-Suche erfolgreich: ${searchResults.length} Ergebnisse`);
    return summary;
    
  } catch (error) {
    const errorMessage = `Fehler bei der Web-Suche: ${error}. Stelle sicher, dass der Web-Search Service (http://localhost:3004) läuft.`;
    console.error('❌', errorMessage);
    return errorMessage;
  }
}
