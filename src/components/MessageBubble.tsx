import React from 'react';
import { cn, formatTimestamp } from '../lib/utils';
import { Message, CodeArtifact } from '../types/chat';
import { User, Bot, Settings, Eye, EyeOff, Sparkles, Code, Play, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { FullscreenPreview } from './FullscreenPreview';

interface MessageBubbleProps {
  message: Message;
  onOpenPreview?: (artifacts: CodeArtifact[]) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOpenPreview }) => {
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
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content || (isStreaming && '...')}
        </div>
      </div>

      {/* Thinking Mode Display */}
      {message.thinking && (
        <div className="mt-4">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-2"
          >
            {showThinking ? <EyeOff size={12} /> : <Eye size={12} />}
            {showThinking ? 'Denkprozess verbergen' : 'Denkprozess anzeigen'}
          </button>
          {showThinking && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 text-sm font-mono text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                <Sparkles size={14} />
                <span className="font-medium">💭 Denkprozess:</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{message.thinking}</div>
            </div>
          )}
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
                  <button
                    onClick={() => setShowFullscreenPreview(true)}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <AlertCircle size={12} />
                    Einfache Vorschau
                  </button>
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
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm mt-2"
        >
          <Code size={14} />
          In isolierter Umgebung öffnen
        </button>
      )}

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
