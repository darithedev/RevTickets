import { apiClient } from './client';

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
  emotions: string[];
  escalation_recommended: boolean;
  summary: string;
}

export interface TicketSentimentResponse {
  ticket_id: string;
  sentiment: SentimentResult;
  analyzed_at: string;
}

export interface CommentSentimentResponse {
  comment_id: string;
  sentiment: SentimentResult;
  analyzed_at: string;
}

export interface CommentSentimentDetail {
  comment_id: string;
  user_id: string | null;
  sentiment: SentimentResult;
  created_at: string | null;
}

export interface SentimentTrends {
  average_score: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  escalation_rate: number;
  common_emotions: Array<{
    emotion: string;
    count: number;
  }>;
}

export interface FullTicketSentimentResponse {
  ticket_id: string;
  ticket_sentiment: SentimentResult;
  comment_sentiments: CommentSentimentDetail[];
  overall_trends: SentimentTrends;
  analyzed_at: string;
}

export interface EscalationCheckResponse {
  ticket_id: string;
  should_escalate: boolean;
  reasons: {
    ticket_negative: boolean;
    negative_comments: number;
    average_score: number;
    escalation_rate: number;
  };
  recommendation: string;
}

export interface DailyTrend {
  date: string;
  count: number;
  average_score: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SentimentAnalyticsResponse {
  period_days: number;
  total_tickets: number;
  sentiments_analyzed: number;
  average_score: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  escalation_rate: number;
  common_emotions: Array<{
    emotion: string;
    count: number;
  }>;
  daily_trends: DailyTrend[];
}

export const sentimentApi = {
  async analyzeTicket(ticketId: string): Promise<TicketSentimentResponse> {
    return apiClient.get(`/sentiment/ticket/${ticketId}`);
  },

  async analyzeComment(commentId: string): Promise<CommentSentimentResponse> {
    return apiClient.get(`/sentiment/comment/${commentId}`);
  },

  async analyzeTicketFull(ticketId: string): Promise<FullTicketSentimentResponse> {
    return apiClient.get(`/sentiment/ticket/${ticketId}/full`);
  },

  async checkEscalation(ticketId: string): Promise<EscalationCheckResponse> {
    return apiClient.get(`/sentiment/ticket/${ticketId}/escalation`);
  },

  async getAnalytics(params?: {
    days?: number;
    category_id?: string;
    agent_id?: string;
  }): Promise<SentimentAnalyticsResponse> {
    return apiClient.get('/sentiment/analytics', { params });
  },
};
