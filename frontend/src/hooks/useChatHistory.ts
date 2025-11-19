import { useState, useCallback, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ id: string; title: string }>;
  suggestedActions?: string[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'kb_chat_sessions';
const MAX_SESSIONS = 10;

export function useChatHistory(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessionId || generateSessionId();
  });
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatSession[];
        setSessions(parsed.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
      } catch (e) {
        console.error('Failed to parse chat sessions:', e);
      }
    }
  }, []);

  // Load current session's messages
  useEffect(() => {
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
      setMessages(session.messages);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, sessions]);

  // Save sessions to localStorage
  const saveSessions = useCallback((updatedSessions: ChatSession[]) => {
    if (typeof window === 'undefined') return;

    // Keep only the most recent sessions
    const trimmed = updatedSessions.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    setSessions(trimmed);
  }, []);

  // Add a message to the current session
  const addMessage = useCallback((
    role: 'user' | 'assistant',
    content: string,
    sources?: Array<{ id: string; title: string }>,
    suggestedActions?: string[]
  ) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      sources,
      suggestedActions
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];

      // Update or create session
      setSessions(prevSessions => {
        const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
        let updatedSessions: ChatSession[];

        if (sessionIndex >= 0) {
          updatedSessions = [...prevSessions];
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            messages: updated,
            updatedAt: new Date()
          };
        } else {
          const newSession: ChatSession = {
            id: currentSessionId,
            messages: updated,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          updatedSessions = [newSession, ...prevSessions];
        }

        saveSessions(updatedSessions);
        return updatedSessions;
      });

      return updated;
    });

    return newMessage;
  }, [currentSessionId, saveSessions]);

  // Clear current session
  const clearHistory = useCallback(() => {
    setMessages([]);
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== currentSessionId);
      saveSessions(updated);
      return updated;
    });
  }, [currentSessionId, saveSessions]);

  // Start a new session
  const startNewSession = useCallback(() => {
    const newId = generateSessionId();
    setCurrentSessionId(newId);
    setMessages([]);
    return newId;
  }, []);

  // Switch to an existing session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveSessions(updated);

      // If deleting current session, start a new one
      if (sessionId === currentSessionId) {
        const newId = generateSessionId();
        setCurrentSessionId(newId);
        setMessages([]);
      }

      return updated;
    });
  }, [currentSessionId, saveSessions]);

  // Get messages formatted for API
  const getApiHistory = useCallback(() => {
    return messages.map(m => ({
      role: m.role,
      content: m.content
    }));
  }, [messages]);

  return {
    messages,
    currentSessionId,
    sessions,
    isLoading,
    setIsLoading,
    addMessage,
    clearHistory,
    startNewSession,
    switchSession,
    deleteSession,
    getApiHistory
  };
}

// Helper functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
