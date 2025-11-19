'use client';

import { useState } from 'react';
import { Button, TextInput, Select, Textarea, Label, Checkbox } from 'flowbite-react';
import { Plus, X } from 'lucide-react';
import type { EscalationRule, CreateEscalationRule, UpdateEscalationRule } from '../types';

interface EscalationRuleBuilderProps {
  rule?: EscalationRule;
  onSubmit: (data: CreateEscalationRule | UpdateEscalationRule) => void;
  onCancel: () => void;
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

export function EscalationRuleBuilder({ rule, onSubmit, onCancel }: EscalationRuleBuilderProps) {
  // Form state
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [priorityOrder, setPriorityOrder] = useState(rule?.priority_order || 0);

  // Trigger configuration
  const [triggerType, setTriggerType] = useState(rule?.trigger_type || 'time_based');
  const [triggerMinutes, setTriggerMinutes] = useState(rule?.trigger_minutes?.toString() || '');
  const [triggerPriority, setTriggerPriority] = useState(rule?.trigger_priority || '');

  // Conditions
  const [conditions, setConditions] = useState<Condition[]>(rule?.conditions || []);

  // Action configuration
  const [actionType, setActionType] = useState(rule?.action_type || 'reassign_to_tier');
  const [targetAgentId, setTargetAgentId] = useState(rule?.target_agent_id || '');
  const [targetTier, setTargetTier] = useState(rule?.target_tier || 'tier_2');
  const [increasePriorityTo, setIncreasePriorityTo] = useState(rule?.increase_priority_to || '');

  // Scope
  const [categoryId, setCategoryId] = useState(rule?.category_id || '');
  const [appliesToPriorities, setAppliesToPriorities] = useState<string[]>(
    rule?.applies_to_priorities || []
  );

  // Notification
  const [notificationMessage, setNotificationMessage] = useState(rule?.notification_message || '');

  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'status', operator: 'equals', value: '' }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handlePriorityToggle = (priority: string) => {
    if (appliesToPriorities.includes(priority)) {
      setAppliesToPriorities(appliesToPriorities.filter(p => p !== priority));
    } else {
      setAppliesToPriorities([...appliesToPriorities, priority]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateEscalationRule | UpdateEscalationRule = {
      name,
      description: description || undefined,
      is_active: isActive,
      priority_order: priorityOrder,
      trigger_type: triggerType,
      trigger_minutes: triggerMinutes ? parseInt(triggerMinutes) : undefined,
      trigger_priority: triggerPriority || undefined,
      conditions: conditions.length > 0 ? conditions : undefined,
      action_type: actionType,
      target_agent_id: targetAgentId || undefined,
      target_tier: actionType.includes('tier') ? targetTier : undefined,
      increase_priority_to: increasePriorityTo || undefined,
      category_id: categoryId || undefined,
      applies_to_priorities: appliesToPriorities.length > 0 ? appliesToPriorities : undefined,
      notification_message: notificationMessage || undefined,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>

        <div>
          <Label htmlFor="name" value="Rule Name *" />
          <TextInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Critical Ticket Escalation"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" value="Description" />
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe when and why this rule triggers..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priorityOrder" value="Priority Order" />
            <TextInput
              id="priorityOrder"
              type="number"
              value={priorityOrder}
              onChange={(e) => setPriorityOrder(parseInt(e.target.value) || 0)}
              helperText="Lower numbers run first"
            />
          </div>
          <div className="flex items-center pt-6">
            <Checkbox
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Label htmlFor="isActive" className="ml-2">Rule is active</Label>
          </div>
        </div>
      </div>

      {/* Trigger Configuration */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trigger Configuration</h3>

        <div>
          <Label htmlFor="triggerType" value="Trigger Type *" />
          <Select
            id="triggerType"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            required
          >
            <option value="time_based">Time Based</option>
            <option value="priority_based">Priority Based</option>
            <option value="sla_breach">SLA Breach</option>
            <option value="no_response">No Response</option>
          </Select>
        </div>

        {(triggerType === 'time_based' || triggerType === 'no_response') && (
          <div>
            <Label htmlFor="triggerMinutes" value="Trigger After (minutes)" />
            <TextInput
              id="triggerMinutes"
              type="number"
              value={triggerMinutes}
              onChange={(e) => setTriggerMinutes(e.target.value)}
              placeholder="e.g., 60"
            />
          </div>
        )}

        {triggerType === 'priority_based' && (
          <div>
            <Label htmlFor="triggerPriority" value="Trigger on Priority" />
            <Select
              id="triggerPriority"
              value={triggerPriority}
              onChange={(e) => setTriggerPriority(e.target.value)}
            >
              <option value="">Select priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        )}
      </div>

      {/* Additional Conditions */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Conditions</h3>
          <Button size="xs" color="gray" onClick={handleAddCondition} type="button">
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
        </div>

        {conditions.map((condition, index) => (
          <div key={index} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <Select
              value={condition.field}
              onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              className="flex-1"
            >
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="age_minutes">Age (minutes)</option>
            </Select>
            <Select
              value={condition.operator}
              onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              className="flex-1"
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
            </Select>
            <TextInput
              value={condition.value}
              onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1"
            />
            <Button
              size="xs"
              color="failure"
              onClick={() => handleRemoveCondition(index)}
              type="button"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {conditions.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No additional conditions. The rule will trigger based on the trigger type alone.
          </p>
        )}
      </div>

      {/* Action Configuration */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Configuration</h3>

        <div>
          <Label htmlFor="actionType" value="Action Type *" />
          <Select
            id="actionType"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            required
          >
            <option value="reassign">Reassign to Specific Agent</option>
            <option value="reassign_to_tier">Reassign to Tier</option>
            <option value="notify">Notify Only</option>
            <option value="increase_priority">Increase Priority</option>
            <option value="reassign_and_notify">Reassign & Notify</option>
          </Select>
        </div>

        {(actionType === 'reassign_to_tier' || actionType === 'reassign_and_notify') && (
          <div>
            <Label htmlFor="targetTier" value="Target Tier" />
            <Select
              id="targetTier"
              value={targetTier}
              onChange={(e) => setTargetTier(e.target.value)}
            >
              <option value="tier_1">Tier 1</option>
              <option value="tier_2">Tier 2</option>
              <option value="tier_3">Tier 3</option>
              <option value="manager">Manager</option>
            </Select>
          </div>
        )}

        {actionType === 'reassign' && (
          <div>
            <Label htmlFor="targetAgentId" value="Target Agent ID" />
            <TextInput
              id="targetAgentId"
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              placeholder="Enter agent ID"
            />
          </div>
        )}

        {(actionType === 'increase_priority' || actionType.includes('reassign')) && (
          <div>
            <Label htmlFor="increasePriorityTo" value="Increase Priority To (optional)" />
            <Select
              id="increasePriorityTo"
              value={increasePriorityTo}
              onChange={(e) => setIncreasePriorityTo(e.target.value)}
            >
              <option value="">Keep current priority</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>
        )}
      </div>

      {/* Scope */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scope</h3>

        <div>
          <Label htmlFor="categoryId" value="Category (optional)" />
          <TextInput
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="Leave empty for all categories"
          />
        </div>

        <div>
          <Label value="Apply to Priorities" />
          <div className="flex flex-wrap gap-4 mt-2">
            {['low', 'medium', 'high', 'critical'].map((priority) => (
              <div key={priority} className="flex items-center">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={appliesToPriorities.includes(priority)}
                  onChange={() => handlePriorityToggle(priority)}
                />
                <Label htmlFor={`priority-${priority}`} className="ml-2 capitalize">
                  {priority}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave all unchecked to apply to all priorities
          </p>
        </div>
      </div>

      {/* Notification */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification</h3>

        <div>
          <Label htmlFor="notificationMessage" value="Custom Notification Message (optional)" />
          <Textarea
            id="notificationMessage"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Custom message to include in notifications..."
            rows={2}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button color="gray" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
        >
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}
