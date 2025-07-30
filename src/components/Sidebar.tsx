import React from 'react';
import { cn, formatTimestamp } from '../lib/utils';
import { MessageSquare, Plus, X, Settings, PanelLeft, Trash2 } from 'lucide-react';
import { useChatHistory, ChatSession } from '../hooks/useChatHistory';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onLoadChat?: (sessionId: string) => void;
  currentSessionId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onToggle, 
  onNewChat, 
  onOpenSettings, 
  onLoadChat,
  currentSessionId 
}) => {
  const { chatSessions, deleteChatSession, clearChatHistory } = useChatHistory();
  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleOpenSettings = () => {
    onOpenSettings();
    onClose();
  };

  return (
    <div className={cn(
      "h-full bg-chat-sidebar border-r border-border overflow-hidden",
      !isOpen && "hidden"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Chats</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Neuer Chat"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Sidebar ein-/ausblenden"
              >
                <PanelLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chatSessions.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Keine Chat-Verlauf vorhanden
              </div>
            ) : (
              <>
                {/* Clear all button */}
                <button
                  onClick={clearChatHistory}
                  className="w-full p-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Alle Chats löschen"
                >
                  <Trash2 size={12} />
                  Alle löschen
                </button>
                
                {/* Chat sessions */}
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group",
                      currentSessionId === session.id && "bg-accent"
                    )}
                    onClick={() => {
                      onLoadChat?.(session.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {session.messageCount} Nachrichten • {formatTimestamp(session.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                        title="Chat löschen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleOpenSettings}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <Settings size={16} className="text-muted-foreground" />
            <span className="text-sm">Einstellungen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
