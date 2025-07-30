import React from 'react';
import { cn, formatTimestamp } from '../lib/utils';
import { Message, CodeArtifact } from '../types/chat';
import { User, Bot, Settings, Eye, EyeOff, Sparkles, Code, Play, AlertCircle, Search, Book, Save } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { FullscreenPreview } from './FullscreenPreview';

interface MessageBubbleProps {
  message: Message;
  onOpenPreview?: (artifacts: CodeArtifact[]) => void;
  onSaveArtifact?: (artifact: CodeArtifact) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOpenPreview, onSaveArtifact }) => {
  const { settings } = useSettings();
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const [showThinking, setShowThinking] = React.useState(false);
  const [showToolCalls, setShowToolCalls] = React.useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = React.useState(false);

  const handleViewCode = () => {
    if (message.codeArtifacts && message.codeArtifacts.length > 0 && onOpenPreview) {
      onOpenPreview(message.codeArtifacts);
    }
  };

  const handleSaveArtifact = (artifact: CodeArtifact) => {
    if (onSaveArtifact) {
      onSaveArtifact(artifact);
    }
  };

  return (
    <div className={cn(
      'message-bubble',
      isUser ? 'message-user' : 'message-assistant'
    )}>
      {/* Message Header */}
      <div className={cn(
        'flex items-center gap-3 mb-3',
        isUser && 'justify-end'
      )}>
        <div className={cn(
          'flex items-center gap-2',
          isUser && 'flex-row-reverse'
        )}>
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
          )}>
            {isUser ? (
              <User size={16} />
            ) : (
              <Bot size={16} />
            )}
          </div>
          <div className={cn(
            'flex items-center gap-2',
            isUser && 'flex-row-reverse'
          )}>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isUser ? 'Du' : 'ChatGLM'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Schreibt...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="message-content">
        {/* Thinking Process */}
        {message.thinking && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 text-sm font-mono text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                <Sparkles size={14} />
                <span className="font-medium">💭 Denkprozess:</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{message.thinking}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content || (isStreaming && '...')}
        </div>

        {/* Search Results */}
        {message.searchResults && message.searchResults.length > 0 && (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 text-sm border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                <Search size={14} />
                <span className="font-medium">🔍 Gefundene Ressourcen:</span>
              </div>
              <div className="space-y-2">
                {message.searchResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    {result.type === 'code' ? (
                      <Code size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                    ) : (
                      <Book size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {result.title}
                      </a>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {result.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Code Artifacts Display */}
        {message.codeArtifacts && message.codeArtifacts.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Code size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Code Artifacts ({message.codeArtifacts.length})
              </span>
            </div>
            <div className="space-y-3">
              {message.codeArtifacts.map((artifact) => (
                <div key={artifact.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">{artifact.filename}</span>
                      <span className="text-xs text-gray-500">({artifact.language})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveArtifact?.(artifact)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                      >
                        <Save size={12} />
                        Speichern
                      </button>
                      <button
                        onClick={() => setShowFullscreenPreview(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye size={12} />
                        Vorschau
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs bg-white dark:bg-gray-800 rounded-lg p-3 overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                    <code>{artifact.content.substring(0, 500)}{artifact.content.length > 500 ? '...' : ''}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {message.codeArtifacts && message.codeArtifacts.length > 0 && (
          <button
            onClick={handleViewCode}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm mt-4"
          >
            <Code size={14} />
            In isolierter Umgebung öffnen
          </button>
        )}
      </div>

      {/* Function/Tool Calls Display */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowToolCalls(!showToolCalls)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-2"
          >
            <Settings size={12} />
            {showToolCalls ? 'Tool-Aufrufe verbergen' : `${message.toolCalls.length} Tool-Aufruf${message.toolCalls.length > 1 ? 'e' : ''} anzeigen`}
          </button>
          {showToolCalls && (
            <div className="space-y-3">
              {message.toolCalls.map((toolCall) => (
                <div key={toolCall.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-sm border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings size={14} className="text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">{toolCall.function.name}</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Argumente:</strong>
                  </div>
                  <pre className="text-xs bg-white dark:bg-gray-800 rounded-lg p-3 overflow-x-auto border border-gray-200 dark:border-gray-700">
                    {JSON.stringify(JSON.parse(toolCall.function.arguments || '{}'), null, 2)}
                  </pre>
                  {message.toolCallResults && message.toolCallResults.find(r => r.toolCallId === toolCall.id) && (
                    <div className="mt-3">
                      <div className="text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Ergebnis:</strong>
                      </div>
                      <div className="text-sm bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        {message.toolCallResults.find(r => r.toolCallId === toolCall.id)?.output}
                      </div>
                      {message.toolCallResults.find(r => r.toolCallId === toolCall.id)?.error && (
                        <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
                          Fehler: {message.toolCallResults.find(r => r.toolCallId === toolCall.id)?.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streaming cursor */}
      {isStreaming && message.content && (
        <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse rounded-full" />
      )}

      {/* Fullscreen Preview */}
      {message.codeArtifacts && message.codeArtifacts.length > 0 && (
        <FullscreenPreview
          artifacts={message.codeArtifacts}
          isOpen={showFullscreenPreview}
          onClose={() => setShowFullscreenPreview(false)}
        />
      )}
    </div>
  );
};
