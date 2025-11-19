/**
 * WebSocket connection hook for real-time communication.
 * Handles connection lifecycle, authentication, and message handling.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export interface UseWebSocketOptions {
  url: string;
  token: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  sendMessage: (message: WebSocketMessage) => void;
  disconnect: () => void;
  reconnect: () => void;
  isConnected: boolean;
}

export function useWebSocket({
  url,
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) {
      console.log('WebSocket: No token provided, skipping connection');
      return;
    }

    // Clean up existing connection
    cleanup();

    setStatus('connecting');

    try {
      // Construct WebSocket URL with token
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket: Connected');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          onMessage?.(message);
        } catch (error) {
          console.error('WebSocket: Failed to parse message', error);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket: Error', event);
        setStatus('error');
        onError?.(event);
      };

      ws.onclose = (event) => {
        console.log('WebSocket: Disconnected', event.code, event.reason);
        setStatus('disconnected');
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if enabled and not exceeded max attempts
        if (
          reconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          event.code !== 4001 // Don't reconnect on auth failure
        ) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `WebSocket: Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket: Failed to connect', error);
      setStatus('error');
    }
  }, [
    url,
    token,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect,
    reconnectInterval,
    maxReconnectAttempts,
    cleanup,
  ]);

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
    cleanup();
    setStatus('disconnected');
  }, [cleanup, maxReconnectAttempts]);

  const reconnectNow = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket: Cannot send message, not connected');
    }
  }, []);

  // Connect when token becomes available
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [token, connect, cleanup]);

  return {
    status,
    sendMessage,
    disconnect,
    reconnect: reconnectNow,
    isConnected: status === 'connected',
  };
}

export default useWebSocket;
