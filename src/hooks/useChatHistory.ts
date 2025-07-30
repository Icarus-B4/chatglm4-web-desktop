import { useState, useEffect, useCallback } from 'react';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  lastMessage?: string;
}

const CHAT_HISTORY_KEY = 'chatglm-chat-history';

export const useChatHistory = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load chat history from localStorage
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const stored = localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const sessions = parsed.map((session: any) => ({
            ...session,
            timestamp: new Date(session.timestamp)
          }));
          setChatSessions(sessions);
        }
      } catch (error) {
        console.warn('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = useCallback((sessions: ChatSession[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, []);

  // Add new chat session
  const addChatSession = useCallback((title: string, messageCount: number = 0, lastMessage?: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      timestamp: new Date(),
      messageCount,
      lastMessage
    };

    const updatedSessions = [newSession, ...chatSessions];
    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
    return newSession.id;
  }, [chatSessions, saveChatHistory]);

  // Update existing chat session
  const updateChatSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    const updatedSessions = chatSessions.map(session => 
      session.id === id ? { ...session, ...updates } : session
    );
    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
  }, [chatSessions, saveChatHistory]);

  // Delete chat session
  const deleteChatSession = useCallback((id: string) => {
    const updatedSessions = chatSessions.filter(session => session.id !== id);
    setChatSessions(updatedSessions);
    saveChatHistory(updatedSessions);
  }, [chatSessions, saveChatHistory]);

  // Clear all chat history
  const clearChatHistory = useCallback(() => {
    setChatSessions([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  // Get chat session by ID
  const getChatSession = useCallback((id: string) => {
    return chatSessions.find(session => session.id === id);
  }, [chatSessions]);

  return {
    chatSessions,
    addChatSession,
    updateChatSession,
    deleteChatSession,
    clearChatHistory,
    getChatSession
  };
}; 