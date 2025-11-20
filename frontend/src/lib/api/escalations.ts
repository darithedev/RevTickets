import { apiClient } from './client';
import type {
  EscalationRule,
  CreateEscalationRule,
  UpdateEscalationRule,
  EscalationHistoryItem,
  ManualEscalationRequest,
  AgentTierInfo,
  EscalationStats,
  EscalationLevel
} from '../../app/shared/types';

const BASE_URL = '/escalations';

export const escalationsApi = {
  // === Escalation Rules ===

  async getRules(activeOnly: boolean = false): Promise<EscalationRule[]> {
    return apiClient.get(`${BASE_URL}/rules`, { params: { active_only: activeOnly } });
  },

  async getRule(ruleId: string): Promise<EscalationRule> {
    return apiClient.get(`${BASE_URL}/rules/${ruleId}`);
  },

  async createRule(rule: CreateEscalationRule): Promise<EscalationRule> {
    return apiClient.post(`${BASE_URL}/rules`, rule);
  },

  async updateRule(ruleId: string, rule: UpdateEscalationRule): Promise<EscalationRule> {
    return apiClient.put(`${BASE_URL}/rules/${ruleId}`, rule);
  },

  async deleteRule(ruleId: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/rules/${ruleId}`);
  },

  async toggleRule(ruleId: string): Promise<EscalationRule> {
    return apiClient.post(`${BASE_URL}/rules/${ruleId}/toggle`);
  },

  // === Escalation History ===

  async getTicketHistory(ticketId: string): Promise<EscalationHistoryItem[]> {
    return apiClient.get(`${BASE_URL}/history/ticket/${ticketId}`);
  },

  // === Statistics ===

  async getStats(): Promise<EscalationStats> {
    return apiClient.get(`${BASE_URL}/stats`);
  },

  // === Manual Escalation ===

  async escalateTicket(
    ticketId: string,
    request: ManualEscalationRequest
  ): Promise<{
    success: boolean;
    ticket_id: string;
    target_tier: string;
    previous_agent?: string;
    new_agent?: string;
    previous_priority?: string;
    new_priority?: string;
    history_id: string;
  }> {
    return apiClient.post(`${BASE_URL}/ticket/${ticketId}/escalate`, request);
  },

  // === Agent Tiers ===

  async getAgentTier(userId: string): Promise<AgentTierInfo> {
    return apiClient.get(`${BASE_URL}/tiers/agent/${userId}`);
  },

  async setAgentTier(
    userId: string,
    tier: EscalationLevel,
    categoryIds?: string[],
    maxTickets?: number
  ): Promise<AgentTierInfo> {
    return apiClient.post(`${BASE_URL}/tiers/agent/${userId}`, {
      tier,
      category_ids: categoryIds,
      max_tickets: maxTickets
    });
  },

  async getAgentsByTier(tier: EscalationLevel): Promise<{
    user_id: string;
    name: string;
    email: string;
    tier: string;
    max_tickets: number;
    is_available: boolean;
  }[]> {
    return apiClient.get(`${BASE_URL}/tiers/${tier}`);
  },

  // === Task Triggers ===

  async triggerCheck(): Promise<{ message: string; task_id?: string }> {
    return apiClient.post(`${BASE_URL}/check-all`);
  },

  async triggerTicketCheck(ticketId: string): Promise<{ message: string; task_id?: string }> {
    return apiClient.post(`${BASE_URL}/check-ticket/${ticketId}`);
  },
};
