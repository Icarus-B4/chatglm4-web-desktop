import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="message-bubble message-assistant animate-fade-in">
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ChatGLM
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Schreibt...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typing Dots */}
      <div className="typing-indicator">
        <div 
          className="typing-dot" 
          style={{ '--delay': 0 } as React.CSSProperties}
        />
        <div 
          className="typing-dot" 
          style={{ '--delay': 1 } as React.CSSProperties}
        />
        <div 
          className="typing-dot" 
          style={{ '--delay': 2 } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
