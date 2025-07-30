import React, { useState, useEffect } from 'react';
import { useDevServer } from './DevServerManager';
import { CodeArtifact } from '../types/chat';
import { extractCodeArtifactsFromClaude } from '../services/claudeCodeService';
import { Play, Server, ExternalLink } from 'lucide-react';

import { CodePreview } from './CodePreview'; // Importiere die Code-Vorschau

interface SDKMessage {
  role?: string;
  content?: string;
  type?: string;
  name?: string;
  input?: any;
  tool_calls?: any[];
}

interface ClaudeCodeIntegrationProps {
  messages: SDKMessage[];
  onOpenInDaytona?: (artifacts: CodeArtifact[]) => void;
}

export const ClaudeCodeIntegration: React.FC<ClaudeCodeIntegrationProps> = ({ 
  messages, 
  onOpenInDaytona 
}) => {
  const [generatedArtifacts, setGeneratedArtifacts] = useState<CodeArtifact[]>([]);
  const { serverStatus, startServer, stopServer } = useDevServer(generatedArtifacts);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Status für die Vorschau
  
  // Extrahiere Code-Artefakte aus verschiedenen Message-Formaten
  useEffect(() => {
    console.log('🔄 ClaudeCodeIntegration: Aktualisiere Artifacts für', messages.length, 'Messages');
    
    // Verwende die vereinheitlichte Extraktionsfunktion
    const extractedArtifacts = extractCodeArtifactsFromClaude(messages as any[]);
    
    console.log('📋 ClaudeCodeIntegration: Extrahierte Artifacts:', extractedArtifacts.length);
    setGeneratedArtifacts(extractedArtifacts);

    // Öffne die Vorschau automatisch wenn neue Artifacts da sind
    if (extractedArtifacts.length > 0) {
        setIsPreviewOpen(true);
    }

  }, [messages]);

  const handleRunInDaytona = () => {
    if (generatedArtifacts.length > 0) {
      if (onOpenInDaytona) {
        onOpenInDaytona(generatedArtifacts);
      } else {
        startServer();
      }
    }
  };

  const generatedPages = messages
    .filter((m: any) => 
      m.type === 'tool_use' && 
      m.name === 'Write' && 
      m.input?.file_path?.includes('/app/') &&
      (m.input?.file_path?.endsWith('.tsx') || m.input?.file_path?.endsWith('/page.tsx'))
    )
    .map((m: any) => {
      const path = m.input.file_path;
      const match = path.match(/\/app\/([^\/]+)\//);
      return match ? `/${match[1]}` : null;
    })
    .filter(Boolean);

  if (messages.length === 0) return null;

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Claude Code Generation</h3>
          <div className="flex gap-2 items-center">
            {/* Daytona Integration Button */}
            {generatedArtifacts.length > 0 && (
              <button
                onClick={handleRunInDaytona}
                disabled={serverStatus.status === 'starting'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {serverStatus.status === 'starting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run in Daytona
                  </>
                )}
              </button>
            )}
            
            {/* Server Status */}
            {serverStatus.status === 'running' && serverStatus.url && (
              <a
                href={serverStatus.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
                View Live App
              </a>
            )}
            
            {/* Generated Pages Links */}
            {generatedPages.length > 0 && serverStatus.status === 'running' && (
              <>
                {generatedPages.map((page, idx) => (
                  <a
                    key={idx}
                    href={`${serverStatus.url}${page}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Open {page} →
                  </a>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Server Status Display */}
        {serverStatus.status !== 'stopped' && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-blue-400" />
                <span className="text-white font-medium">Daytona Sandbox</span>
                <div className={`w-2 h-2 rounded-full ${
                  serverStatus.status === 'running' ? 'bg-green-500' : 
                  serverStatus.status === 'starting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              {serverStatus.status === 'running' && (
                <button
                  onClick={stopServer}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Stop Server
                </button>
              )}
            </div>
            {serverStatus.error && (
              <div className="mt-2 text-red-400 text-sm">{serverStatus.error}</div>
            )}
          </div>
        )}
        
        {/* Generated Artifacts Summary */}
        {generatedArtifacts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="text-blue-400 font-semibold mb-2">
              📁 Generated Files ({generatedArtifacts.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {generatedArtifacts.map((artifact, idx) => (
                <div key={idx} className="text-gray-300 text-sm">
                  <span className="font-mono">{artifact.filename}</span>
                  <span className="text-gray-500 ml-2">({artifact.language})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <CodePreview 
          artifacts={generatedArtifacts}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </div>
    </div>
  );
};

// Original MessageDisplay component (leicht angepasst)
interface MessageDisplayProps {
  messages: SDKMessage[];
}

function MessageDisplay({ messages }: MessageDisplayProps) {
  if (messages.length === 0) return null;
  
  const displayMessages = messages.filter(m => 
    m.type === 'assistant' || m.type === 'tool_use' || m.type === 'result'
  );
  
  return (
    <div className="max-h-[400px] overflow-y-auto space-y-3">
      {displayMessages.map((message, index) => {
        // Assistant messages
        if (message.type === 'assistant' && (message as any).message?.content) {
          const content = (message as any).message.content;
          const textContent = Array.isArray(content) 
            ? content.find((c: any) => c.type === 'text')?.text 
            : content;
            
          if (!textContent) return null;
          
          return (
            <div key={index} className="animate-fadeIn">
              <div className="text-gray-300 leading-relaxed">
                {textContent}
              </div>
            </div>
          );
        }
        
        // Tool uses
        if (message.type === 'tool_use') {
          const toolName = (message as any).name;
          const input = (message as any).input;
          
          return (
            <div key={index} className="animate-fadeIn">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-mono">
                  {toolName === 'Write' && input?.file_path && 
                    `Creating ${input.file_path.split('/').pop()}`}
                  {toolName === 'Edit' && input?.file_path && 
                    `Editing ${input.file_path.split('/').pop()}`}
                  {toolName === 'Read' && input?.file_path && 
                    `Reading ${input.file_path.split('/').pop()}`}
                  {toolName === 'Bash' && input?.command && 
                    `Running: ${input.command.substring(0, 50)}...`}
                  {!['Write', 'Edit', 'Read', 'Bash'].includes(toolName) && 
                    `Using ${toolName}`}
                </span>
              </div>
            </div>
          );
        }
        
        // Final result
        if (message.type === 'result' && (message as any).subtype === 'success') {
          return (
            <div key={index} className="animate-fadeIn mt-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✅ Generation Complete</div>
                <div className="text-gray-300 text-sm">
                  {(message as any).result}
                </div>
                {(message as any).total_cost_usd && (
                  <div className="text-xs text-gray-500 mt-2">
                    Cost: ${(message as any).total_cost_usd.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        return null;
      })}
      
      {/* Typing indicator */}
      {messages.length > 0 && !messages.some((m: any) => m.type === 'result') && (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
          </div>
          <span className="text-sm">AI is working...</span>
        </div>
      )}
    </div>
  );
}

export default ClaudeCodeIntegration;