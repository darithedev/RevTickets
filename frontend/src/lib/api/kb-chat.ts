import { apiClient } from './client';
import { API_ENDPOINTS } from '../../constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  chat_history?: ChatMessage[];
  session_id?: string;
}

export interface ChatSource {
  id: string;
  title: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  suggested_actions?: string[];
  session_id?: string;
  timestamp: string;
}

export interface TicketSuggestionRequest {
  chat_history: ChatMessage[];
  user_query: string;
}

export interface TicketSuggestion {
  title: string;
  description: string;
  priority: string;
  suggested_category: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  category: string;
}

export const kbChatApi = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post(API_ENDPOINTS.KB_CHAT.CHAT, request);
  },

  async suggestTicket(request: TicketSuggestionRequest): Promise<TicketSuggestion> {
    return apiClient.post(API_ENDPOINTS.KB_CHAT.SUGGEST_TICKET, request);
  },

  async getRelatedArticles(articleId: string, limit: number = 3): Promise<RelatedArticle[]> {
    return apiClient.get(API_ENDPOINTS.KB_CHAT.RELATED(articleId), {
      params: { limit }
    });
  },
};
