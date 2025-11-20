'use client';

/**
 * Real-time state management context.
 * Provides WebSocket connection and real-time features across the app.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useWebSocket, WebSocketMessage, WebSocketStatus } from '../hooks/useWebSocket';

// Types
export interface UserPresence {
  user_id: string;
  user_info: {
    email?: string;
    name?: string;
    role?: string;
  };
  status: 'online' | 'offline' | 'away';
}

export interface TypingUser {
  user_id: string;
  user_info: {
    email?: string;
    name?: string;
    role?: string;
  };
}

export interface RealtimeNotification {
  id: string;
  type: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

export interface RoomState {
  room_id: string;
  users: UserPresence[];
  typing_users: TypingUser[];
}

interface RealtimeState {
  connectionStatus: WebSocketStatus;
  rooms: Record<string, RoomState>;
  notifications: RealtimeNotification[];
  unreadCount: number;
}

type RealtimeAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: WebSocketStatus }
  | { type: 'SET_ROOM_STATE'; payload: RoomState }
  | { type: 'UPDATE_ROOM_USERS'; payload: { room_id: string; users: UserPresence[] } }
  | { type: 'UPDATE_TYPING_USERS'; payload: { room_id: string; user: TypingUser; is_typing: boolean } }
  | { type: 'LEAVE_ROOM'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: RealtimeNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'USER_JOINED_ROOM'; payload: { room_id: string; user: UserPresence } }
  | { type: 'USER_LEFT_ROOM'; payload: { room_id: string; user_id: string } };

interface RealtimeContextType extends RealtimeState {
  // Connection
  isConnected: boolean;
  reconnect: () => void;

  // Room management
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  getRoomUsers: (roomId: string) => UserPresence[];
  getTypingUsers: (roomId: string) => TypingUser[];

  // Typing indicators
  setTyping: (roomId: string, isTyping: boolean) => void;

  // Messages
  sendMessage: (roomId: string, content: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const initialState: RealtimeState = {
  connectionStatus: 'disconnected',
  rooms: {},
  notifications: [],
  unreadCount: 0,
};

function realtimeReducer(state: RealtimeState, action: RealtimeAction): RealtimeState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };

    case 'SET_ROOM_STATE':
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room_id]: action.payload,
        },
      };

    case 'UPDATE_ROOM_USERS':
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room_id]: {
            ...state.rooms[action.payload.room_id],
            room_id: action.payload.room_id,
            users: action.payload.users,
            typing_users: state.rooms[action.payload.room_id]?.typing_users || [],
          },
        },
      };

    case 'UPDATE_TYPING_USERS': {
      const room = state.rooms[action.payload.room_id] || {
        room_id: action.payload.room_id,
        users: [],
        typing_users: [],
      };

      let typing_users = [...room.typing_users];

      if (action.payload.is_typing) {
        // Add user if not already typing
        if (!typing_users.find((u) => u.user_id === action.payload.user.user_id)) {
          typing_users.push(action.payload.user);
        }
      } else {
        // Remove user from typing
        typing_users = typing_users.filter((u) => u.user_id !== action.payload.user.user_id);
      }

      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room_id]: {
            ...room,
            typing_users,
          },
        },
      };
    }

    case 'USER_JOINED_ROOM': {
      const room = state.rooms[action.payload.room_id] || {
        room_id: action.payload.room_id,
        users: [],
        typing_users: [],
      };

      // Add user if not already in room
      if (!room.users.find((u) => u.user_id === action.payload.user.user_id)) {
        return {
          ...state,
          rooms: {
            ...state.rooms,
            [action.payload.room_id]: {
              ...room,
              users: [...room.users, action.payload.user],
            },
          },
        };
      }
      return state;
    }

    case 'USER_LEFT_ROOM': {
      const room = state.rooms[action.payload.room_id];
      if (!room) return state;

      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room_id]: {
            ...room,
            users: room.users.filter((u) => u.user_id !== action.payload.user_id),
            typing_users: room.typing_users.filter((u) => u.user_id !== action.payload.user_id),
          },
        },
      };
    }

    case 'LEAVE_ROOM': {
      const { [action.payload]: removed, ...remainingRooms } = state.rooms;
      return {
        ...state,
        rooms: remainingRooms,
      };
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Keep last 50
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: React.ReactNode;
  token: string | null;
}

export function RealtimeProvider({ children, token }: RealtimeProviderProps) {
  const [state, dispatch] = useReducer(realtimeReducer, initialState);

  // Get WebSocket URL from environment
  const wsUrl = useMemo(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '').replace('http', 'ws');
    return `${baseUrl}/ws`;
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        console.log('Realtime: Connected to server');
        break;

      case 'room_state':
        dispatch({
          type: 'SET_ROOM_STATE',
          payload: {
            room_id: message.room_id as string,
            users: message.users as UserPresence[],
            typing_users: message.typing_users as TypingUser[],
          },
        });
        break;

      case 'user_joined':
        dispatch({
          type: 'USER_JOINED_ROOM',
          payload: {
            room_id: message.room_id as string,
            user: {
              user_id: message.user_id as string,
              user_info: message.user_info as UserPresence['user_info'],
              status: 'online',
            },
          },
        });
        break;

      case 'user_left':
        dispatch({
          type: 'USER_LEFT_ROOM',
          payload: {
            room_id: message.room_id as string,
            user_id: message.user_id as string,
          },
        });
        break;

      case 'typing_indicator':
        dispatch({
          type: 'UPDATE_TYPING_USERS',
          payload: {
            room_id: message.room_id as string,
            user: {
              user_id: message.user_id as string,
              user_info: message.user_info as TypingUser['user_info'],
            },
            is_typing: message.is_typing as boolean,
          },
        });
        break;

      case 'notification':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `${Date.now()}-${Math.random()}`,
            type: message.notification_type as string,
            message: (message.data as Record<string, unknown>)?.message as string || '',
            data: message.data as Record<string, unknown>,
            timestamp: message.timestamp as string,
            read: false,
          },
        });
        break;

      case 'ticket_update':
      case 'new_message':
      case 'ticket_created':
        // These can be handled by components that subscribe to specific events
        // The message will be passed through to any listeners
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.log('Realtime: Unknown message type', message.type);
    }
  }, []);

  const handleConnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
  }, []);

  const handleDisconnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
  }, []);

  const handleError = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
  }, []);

  const { sendMessage, reconnect, isConnected, status } = useWebSocket({
    url: wsUrl,
    token,
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  // Update connection status
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
  }, [status]);

  // Room management
  const joinRoom = useCallback(
    (roomId: string) => {
      sendMessage({ type: 'join_room', room_id: roomId });
    },
    [sendMessage]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      sendMessage({ type: 'leave_room', room_id: roomId });
      dispatch({ type: 'LEAVE_ROOM', payload: roomId });
    },
    [sendMessage]
  );

  const getRoomUsers = useCallback(
    (roomId: string): UserPresence[] => {
      return state.rooms[roomId]?.users || [];
    },
    [state.rooms]
  );

  const getTypingUsers = useCallback(
    (roomId: string): TypingUser[] => {
      return state.rooms[roomId]?.typing_users || [];
    },
    [state.rooms]
  );

  // Typing indicators
  const setTyping = useCallback(
    (roomId: string, isTyping: boolean) => {
      sendMessage({ type: 'typing', room_id: roomId, is_typing: isTyping });
    },
    [sendMessage]
  );

  // Messages
  const sendChatMessage = useCallback(
    (roomId: string, content: string) => {
      sendMessage({ type: 'message', room_id: roomId, content });
    },
    [sendMessage]
  );

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const value: RealtimeContextType = useMemo(
    () => ({
      ...state,
      isConnected,
      reconnect,
      joinRoom,
      leaveRoom,
      getRoomUsers,
      getTypingUsers,
      setTyping,
      sendMessage: sendChatMessage,
      markNotificationRead,
      clearNotifications,
    }),
    [
      state,
      isConnected,
      reconnect,
      joinRoom,
      leaveRoom,
      getRoomUsers,
      getTypingUsers,
      setTyping,
      sendChatMessage,
      markNotificationRead,
      clearNotifications,
    ]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export default RealtimeContext;
