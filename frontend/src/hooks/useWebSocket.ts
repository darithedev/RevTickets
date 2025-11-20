/**
 * Custom hook for WebSocket connections with proper cleanup to prevent memory leaks.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  ticket_id?: string;
  data?: any;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: object) => void;
  subscribe: (ticketId: string) => void;
  unsubscribe: (ticketId: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { user, token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<object[]>([]);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Cleanup function to properly close WebSocket and clear all intervals/timeouts
  const cleanup = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      // Remove event listeners before closing to prevent memory leaks
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;

      if (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      wsRef.current = null;
    }

    // Clear message queue
    messageQueueRef.current = [];

    // Clear subscriptions
    subscriptionsRef.current.clear();

    setIsConnected(false);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user || !token) {
      return;
    }

    // Clean up any existing connection first
    cleanup();

    try {
      // Append token to URL for authentication
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;

        // Process queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            ws.send(JSON.stringify(message));
          }
        }

        // Re-subscribe to any previous subscriptions
        subscriptionsRef.current.forEach(ticketId => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            ticket_id: ticketId
          }));
        });

        // Start ping interval for connection health
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        }, 30000);

        onConnect?.();
      };

      ws.onclose = (event) => {
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        onDisconnect?.();

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectCountRef.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle ping/pong for connection health
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [user, token, url, reconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError, cleanup]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      messageQueueRef.current.push(message);
    }
  }, []);

  // Subscribe to ticket updates
  const subscribe = useCallback((ticketId: string) => {
    subscriptionsRef.current.add(ticketId);
    sendMessage({
      type: 'subscribe',
      ticket_id: ticketId
    });
  }, [sendMessage]);

  // Unsubscribe from ticket updates
  const unsubscribe = useCallback((ticketId: string) => {
    subscriptionsRef.current.delete(ticketId);
    sendMessage({
      type: 'unsubscribe',
      ticket_id: ticketId
    });
  }, [sendMessage]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (user && token) {
      connect();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      cleanup();
    };
  }, [user, token, connect, cleanup]);

  // Effect to handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && user && token) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, user, token, connect]);

  // Effect to handle window unload
  useEffect(() => {
    const handleUnload = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [cleanup]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
  };
}

export default useWebSocket;
