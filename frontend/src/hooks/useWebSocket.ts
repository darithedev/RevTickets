/**
 * Custom hook for WebSocket connections with proper JWT authentication.
 * Ensures all WebSocket connections are properly authenticated to prevent bypass attacks.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  data?: any;
  error?: string;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Event) => void;
  onAuthError?: (reason: string) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: object) => void;
  connectionError: string | null;
}

// WebSocket close codes for authentication errors
const AUTH_ERROR_CODE = 4001;
const TOKEN_EXPIRED_CODE = 4002;

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onAuthError,
  } = options;

  const { user, token, logout } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Update token ref when token changes
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;

      if (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Cleanup');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  // Connect to WebSocket with JWT token
  const connect = useCallback(() => {
    // Don't connect if no user or token
    if (!user || !token) {
      setConnectionError('Authentication required');
      return;
    }

    // Clean up existing connection
    cleanup();
    setConnectionError(null);

    try {
      // IMPORTANT: Pass JWT token as query parameter for authentication
      // The server MUST validate this token before accepting the connection
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsAuthenticated(true);
        reconnectCountRef.current = 0;
        setConnectionError(null);
        onConnect?.();
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsAuthenticated(false);

        // Handle authentication-specific close codes
        if (event.code === AUTH_ERROR_CODE || event.code === TOKEN_EXPIRED_CODE) {
          const reason = event.reason || 'Authentication failed';
          setConnectionError(reason);
          onAuthError?.(reason);

          // If token expired, trigger logout
          if (event.code === TOKEN_EXPIRED_CODE) {
            logout?.();
          }

          // Don't reconnect on auth errors
          return;
        }

        onDisconnect?.(event.code, event.reason);

        // Attempt to reconnect if not a clean close and we have a valid token
        if (event.code !== 1000 &&
            reconnectCountRef.current < reconnectAttempts &&
            tokenRef.current) {
          reconnectCountRef.current++;
          const delay = reconnectInterval * Math.pow(1.5, reconnectCountRef.current - 1);

          reconnectTimeoutRef.current = setTimeout(() => {
            // Verify token is still valid before reconnecting
            if (tokenRef.current) {
              connect();
            }
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error');
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle server-side authentication errors
          if (message.type === 'auth_error') {
            setIsAuthenticated(false);
            setConnectionError(message.error || 'Authentication failed');
            onAuthError?.(message.error || 'Authentication failed');
            ws.close(AUTH_ERROR_CODE, message.error);
            return;
          }

          // Handle successful authentication confirmation
          if (message.type === 'connected' || message.type === 'authenticated') {
            setIsAuthenticated(true);
          }

          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to establish connection');
    }
  }, [user, token, url, reconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError, onAuthError, cleanup, logout]);

  // Send message (only if authenticated)
  const sendMessage = useCallback((message: object) => {
    if (!isAuthenticated) {
      console.warn('Cannot send message: WebSocket not authenticated');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [isAuthenticated]);

  // Connect when user/token available
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [user, token, connect, cleanup]);

  // Handle token refresh - reconnect with new token
  useEffect(() => {
    if (isConnected && token && tokenRef.current !== token) {
      // Token was refreshed, reconnect with new token
      connect();
    }
  }, [token, isConnected, connect]);

  return {
    isConnected,
    isAuthenticated,
    lastMessage,
    sendMessage,
    connectionError,
  };
}

export default useWebSocket;
