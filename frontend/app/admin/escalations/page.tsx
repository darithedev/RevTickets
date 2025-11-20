'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Badge, Modal, TextInput, Select, Textarea, ToggleSwitch, Checkbox, Label } from 'flowbite-react';
import { Plus, Edit, Trash2, RefreshCw, AlertTriangle, Clock, ArrowUp, Users } from 'lucide-react';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { LoadingSpinner } from '../../../src/app/shared/components';
import { EscalationRuleBuilder } from '../../../src/app/shared/components/EscalationRuleBuilder';
import { escalationsApi } from '../../../src/lib/api/escalations';
import { formatFullDateTime } from '../../../src/lib/utils';
import type { EscalationRule, EscalationStats, CreateEscalationRule, UpdateEscalationRule } from '../../../src/app/shared/types';

export default function EscalationsAdminPage() {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EscalationRule | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rulesData, statsData] = await Promise.all([
        escalationsApi.getRules(activeOnly),
        escalationsApi.getStats()
      ]);
      setRules(rulesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch escalation data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRule = async (ruleData: CreateEscalationRule) => {
    try {
      await escalationsApi.createRule(ruleData);
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const handleUpdateRule = async (ruleData: UpdateEscalationRule) => {
    if (!selectedRule) return;
    try {
      await escalationsApi.updateRule(selectedRule.id, ruleData);
      setShowEditModal(false);
      setSelectedRule(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this escalation rule?')) return;
    try {
      await escalationsApi.deleteRule(ruleId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await escalationsApi.toggleRule(ruleId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleTriggerCheck = async () => {
    try {
      await escalationsApi.triggerCheck();
      alert('Escalation check triggered successfully');
    } catch (error) {
      console.error('Failed to trigger escalation check:', error);
    }
  };

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case 'time_based':
        return <Clock className="h-4 w-4" />;
      case 'priority_based':
        return <AlertTriangle className="h-4 w-4" />;
      case 'sla_breach':
        return <ArrowUp className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'time_based':
        return 'Time Based';
      case 'priority_based':
        return 'Priority Based';
      case 'sla_breach':
        return 'SLA Breach';
      case 'no_response':
        return 'No Response';
      case 'customer_request':
        return 'Customer Request';
      default:
        return type;
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'reassign':
        return 'Reassign';
      case 'reassign_to_tier':
        return 'Reassign to Tier';
      case 'notify':
        return 'Notify Only';
      case 'increase_priority':
        return 'Increase Priority';
      case 'reassign_and_notify':
        return 'Reassign & Notify';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner text="Loading escalation rules..." />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Escalation Rules
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure automatic ticket escalation and reassignment rules
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Escalations</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_escalations}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Last 24 Hours</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.last_24_hours}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Automatic</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.automatic}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Manual</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.manual}
                </div>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Button
                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
              <Button
                color="gray"
                onClick={handleTriggerCheck}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Trigger Check
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activeOnly"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
              <Label htmlFor="activeOnly">Show active only</Label>
            </div>
          </div>

          {/* Rules Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Rule Name</Table.HeadCell>
                <Table.HeadCell>Trigger</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
                <Table.HeadCell>Priority</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {rules.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No escalation rules configured</p>
                        <Button
                          size="sm"
                          className="mt-4 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                          onClick={() => setShowCreateModal(true)}
                        >
                          Create First Rule
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  rules.map((rule) => (
                    <Table.Row key={rule.id} className="bg-white dark:bg-gray-800">
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        <div>
                          <div className="font-semibold">{rule.name}</div>
                          {rule.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {rule.description}
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          {getTriggerTypeIcon(rule.trigger_type)}
                          <div>
                            <div className="text-sm">{getTriggerTypeLabel(rule.trigger_type)}</div>
                            {rule.trigger_minutes && (
                              <div className="text-xs text-gray-500">{rule.trigger_minutes} min</div>
                            )}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <div className="text-sm">{getActionTypeLabel(rule.action_type)}</div>
                          {rule.target_tier && (
                            <div className="text-xs text-gray-500">
                              To: {rule.target_tier.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="gray">{rule.priority_order}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <ToggleSwitch
                          checked={rule.is_active}
                          onChange={() => handleToggleRule(rule.id)}
                          label=""
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() => {
                              setSelectedRule(rule);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Create Rule Modal */}
          <Modal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            size="4xl"
          >
            <Modal.Header>Create Escalation Rule</Modal.Header>
            <Modal.Body>
              <EscalationRuleBuilder
                onSubmit={handleCreateRule}
                onCancel={() => setShowCreateModal(false)}
              />
            </Modal.Body>
          </Modal>

          {/* Edit Rule Modal */}
          <Modal
            show={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRule(null);
            }}
            size="4xl"
          >
            <Modal.Header>Edit Escalation Rule</Modal.Header>
            <Modal.Body>
              {selectedRule && (
                <EscalationRuleBuilder
                  rule={selectedRule}
                  onSubmit={handleUpdateRule}
                  onCancel={() => {
                    setShowEditModal(false);
                    setSelectedRule(null);
                  }}
                />
              )}
            </Modal.Body>
          </Modal>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
