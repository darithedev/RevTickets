// Escalation-related types

export type EscalationTriggerType =
  | 'time_based'
  | 'priority_based'
  | 'sla_breach'
  | 'no_response'
  | 'customer_request';

export type EscalationActionType =
  | 'reassign'
  | 'reassign_to_tier'
  | 'notify'
  | 'increase_priority'
  | 'reassign_and_notify';

export type EscalationLevel =
  | 'tier_1'
  | 'tier_2'
  | 'tier_3'
  | 'manager';

export interface EscalationCondition {
  field: string;
  operator: string;
  value: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  priority_order: number;

  trigger_type: string;
  trigger_minutes?: number;
  trigger_priority?: string;

  conditions: EscalationCondition[];

  action_type: string;
  target_agent_id?: string;
  target_tier?: string;
  increase_priority_to?: string;

  category_id?: string;
  applies_to_priorities: string[];

  notification_message?: string;

  created_at: string;
  updated_at: string;
}

export interface CreateEscalationRule {
  name: string;
  description?: string;
  is_active?: boolean;
  priority_order?: number;

  trigger_type: string;
  trigger_minutes?: number;
  trigger_priority?: string;

  conditions?: EscalationCondition[];

  action_type: string;
  target_agent_id?: string;
  target_tier?: string;
  increase_priority_to?: string;

  category_id?: string;
  applies_to_priorities?: string[];

  notify_agents?: string[];
  notification_message?: string;
}

export interface UpdateEscalationRule {
  name?: string;
  description?: string;
  is_active?: boolean;
  priority_order?: number;

  trigger_type?: string;
  trigger_minutes?: number;
  trigger_priority?: string;

  conditions?: EscalationCondition[];

  action_type?: string;
  target_agent_id?: string;
  target_tier?: string;
  increase_priority_to?: string;

  category_id?: string;
  applies_to_priorities?: string[];

  notify_agents?: string[];
  notification_message?: string;
}

export interface EscalationHistoryItem {
  id: string;
  escalation_level: string;
  trigger_type: string;
  action_taken: string;
  previous_agent?: {
    id: string;
    name: string;
    email: string;
  };
  new_agent?: {
    id: string;
    name: string;
    email: string;
  };
  previous_priority?: string;
  new_priority?: string;
  reason: string;
  notes?: string;
  is_automatic: boolean;
  escalated_at: string;
  escalated_by?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ManualEscalationRequest {
  target_tier: EscalationLevel;
  reason: string;
  target_agent_id?: string;
  increase_priority?: boolean;
}

export interface AgentTierInfo {
  user_id: string;
  tier: string;
  max_tickets: number;
  is_available: boolean;
  agent_name?: string;
}

export interface EscalationStats {
  total_escalations: number;
  by_trigger_type: Record<string, number>;
  by_action_type: Record<string, number>;
  automatic: number;
  manual: number;
  last_24_hours: number;
}
