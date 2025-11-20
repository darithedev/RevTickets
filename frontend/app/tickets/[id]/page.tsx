'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, Button, Avatar, Textarea } from 'flowbite-react';
import { MessageCircle, AlertCircle, Edit3, CheckCircle2, XCircle, Home, RotateCcw, Brain, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { MainLayout, ProtectedRoute, SLAIndicator } from '../../../src/app/shared/components';
import { LoadingSpinner } from '../../../src/app/shared/components';
import { RichTextEditor } from '../../../src/app/shared/components/RichTextEditor';
import { ticketsApi } from '../../../src/lib/api';
import { formatFullDateTime, canEditComment, getEditTimeRemaining, canReopenTicket, getReopenTimeRemaining } from '../../../src/lib/utils';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { Ticket, Comment, CreateComment, RichTextContent, TicketStatus, ClosingCommentsResponse } from '../../../src/app/shared/types';
import { createEmptyRichText, convertLegacyContent } from '../../../src/lib/utils';

interface ConflictInfo {
  message: string;
  currentVersion: number;
  yourVersion: number;
  conflictFields?: string[];
  currentStatus?: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [escalationHistory, setEscalationHistory] = useState<EscalationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<RichTextContent>(createEmptyRichText());
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Status management states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closingComment, setClosingComment] = useState('');

  // Comment editing states
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<RichTextContent>(createEmptyRichText());
  const [savingEdit, setSavingEdit] = useState(false);

  // Reopen ticket states
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  // AI Summary states
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // AI closing suggestions states
  const [closingSuggestion, setClosingSuggestion] = useState<ClosingCommentsResponse | null>(null);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);

  const fetchTicketData = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const [ticketData, commentsData, escalationData] = await Promise.all([
        ticketsApi.getById(ticketId),
        ticketsApi.getComments(ticketId),
        escalationsApi.getTicketHistory(ticketId).catch(() => []),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setEscalationHistory(escalationData);
    } catch (error) {
      console.error('Failed to fetch ticket data:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId, fetchTicketData]);

  // Fetch sentiment analysis for agents
  const fetchSentiment = useCallback(async () => {
    if (!ticketId || user?.role !== 'agent') return;

    try {
      setLoadingSentiment(true);
      const data = await sentimentApi.analyzeTicketFull(ticketId);
      setSentimentData(data);
    } catch (error) {
      console.error('Failed to fetch sentiment:', error);
    } finally {
      setLoadingSentiment(false);
    }
  }, [ticketId, user?.role]);

  const handleAddComment = async () => {
    if (!ticketId || !newComment.text.trim()) return;

    try {
      setSubmittingComment(true);
      const commentData: CreateComment = {
        content: newComment,
      };
      
      const newCommentData = await ticketsApi.createComment(ticketId, commentData);
      setComments([...comments, newCommentData]);
      setNewComment(createEmptyRichText());
      
      // Refresh ticket data to get updated status if it changed
      // (e.g., when user responds to a ticket that was waiting for customer)
      const updatedTicket = await ticketsApi.getById(ticketId);
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleConflictError = (error: any, retryAction: () => Promise<void>) => {
    if (error?.response?.status === 409) {
      const detail = error.response.data?.detail;
      if (detail) {
        setConflictInfo({
          message: detail.message || 'Ticket was modified by another user.',
          currentVersion: detail.current_version,
          yourVersion: detail.your_version,
          conflictFields: detail.conflict_fields,
          currentStatus: detail.current_status
        });
        setPendingAction(() => retryAction);
        setShowConflictModal(true);
        return true;
      }
    }
    return false;
  };

  const handleRefreshAndRetry = async () => {
    setShowConflictModal(false);
    setConflictInfo(null);

    // Refresh ticket data
    await fetchTicketData();

    // Clear pending action
    setPendingAction(null);
  };

  const handleForceUpdate = async () => {
    setShowConflictModal(false);
    setConflictInfo(null);

    if (pendingAction) {
      // Refresh first to get latest version, then retry
      await fetchTicketData();
      // Note: The retry will now use the updated version
    }

    setPendingAction(null);
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticketId || !ticket) return;

    const performUpdate = async () => {
      try {
        setUpdatingStatus(true);
        await ticketsApi.updateStatus(ticketId, newStatus);

        // Update local ticket state
        setTicket({ ...ticket, status: newStatus });
      } catch (error: any) {
        if (!handleConflictError(error, () => handleStatusUpdate(newStatus))) {
          console.error('Failed to update ticket status:', error);
        }
      } finally {
        setUpdatingStatus(false);
      }
    };

    await performUpdate();
  };

  const handleCloseTicket = async () => {
    if (!ticketId || !ticket || !closingComment.trim()) return;

    const performClose = async () => {
      try {
        setUpdatingStatus(true);

        // Add closing comment first
        const commentData: CreateComment = {
          content: {
            html: `<p>${closingComment}</p>`,
            json: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: closingComment }]
                }
              ]
            },
            text: closingComment
          }
        };

        const newCommentData = await ticketsApi.createComment(ticketId, commentData);
        setComments([...comments, newCommentData]);

        // Then close the ticket
        await ticketsApi.updateStatus(ticketId, 'closed');
        setTicket({ ...ticket, status: 'closed' });

        // Reset form
        setClosingComment('');
        setShowCloseForm(false);
      } catch (error: any) {
        if (!handleConflictError(error, performClose)) {
          console.error('Failed to close ticket:', error);
        }
      } finally {
        setUpdatingStatus(false);
      }
    };

    await performClose();
  };

  // Comment editing handlers
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(convertLegacyContent(comment.content));
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent(createEmptyRichText());
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentContent.text.trim()) return;

    try {
      setSavingEdit(true);
      const updatedComment = await ticketsApi.updateComment(commentId, {
        content: editCommentContent
      });

      // Update the comment in local state
      setComments(comments.map(c =>
        c.id === commentId
          ? { ...c, content: updatedComment.content, edited: true, editCount: (c.editCount || 0) + 1 }
          : c
      ));

      handleCancelEdit();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setSavingEdit(false);
    }
  };

  // Reopen ticket handler
  const handleReopenTicket = async () => {
    if (!ticketId || !ticket) return;

    try {
      setReopening(true);
      const updatedTicket = await ticketsApi.reopenTicket(ticketId, reopenReason);
      setTicket(updatedTicket);
      setReopenReason('');
      setShowReopenForm(false);
    } catch (error) {
      console.error('Failed to reopen ticket:', error);
    } finally {
      setReopening(false);
    }
  };

  // AI closing suggestion handlers
  const handleGenerateClosingSuggestion = async () => {
    if (!ticketId) return;

    try {
      setGeneratingSuggestion(true);
      const suggestion = await ticketsApi.generateClosingComments(ticketId);
      setClosingSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to generate closing suggestion:', error);
    } finally {
      setGeneratingSuggestion(false);
    }
  };

  const handleApplySuggestion = () => {
    if (closingSuggestion) {
      setClosingComment(closingSuggestion.comment);
    }
  };

  // Check if current user can modify this ticket (agent assigned to it)
  const canModifyTicket = user?.role === 'agent' && ticket?.agentInfo?.id === user.id;

  // Check if ticket can be reopened (by the original user, within 10 business days)
  const canReopen = user?.id === ticket?.userInfo?.id &&
    (ticket?.status === 'closed' || ticket?.status === 'resolved') &&
    ticket?.closedAt &&
    canReopenTicket(ticket.closedAt);

  // Handle AI summary generation
  const handleGenerateSummary = async () => {
    if (!ticketId) return;

    try {
      setGeneratingSummary(true);
      setSummaryError(null);
      const response = await ticketsApi.generateSummary(ticketId);

      // Update the ticket with the new summary
      setTicket(prev => prev ? {
        ...prev,
        aiSummary: response.summary,
        summaryGeneratedAt: response.generatedAt
      } : null);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // AI closing suggestion handlers
  const handleGenerateClosingSuggestion = async () => {
    if (!ticketId) return;

    try {
      setGeneratingSuggestion(true);
      const suggestion = await ticketsApi.generateClosingComments(ticketId);
      setClosingSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to generate closing suggestion:', error);
    } finally {
      setGeneratingSuggestion(false);
    }
  };

  const handleApplySuggestion = () => {
    if (closingSuggestion) {
      setClosingComment(closingSuggestion.comment);
    }
  };



  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner text="Loading ticket..." />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ticket not found</h3>
                <p className="text-sm">The requested ticket could not be loaded.</p>
                <Link href="/tickets">
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                    Go Back
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Breadcrumbs */}
          <Breadcrumb aria-label="Ticket breadcrumb" className="mb-6">
            <BreadcrumbItem>
              <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href="/tickets" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {user?.role === 'agent' ? 'Agent Dashboard' : 'My Tickets'}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              Ticket #{ticketId}
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {ticket.title}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>#{ticketId}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>Created by {ticket.userInfo?.name || ticket.userInfo?.email}</span>
                  {ticket.agentInfo && (
                    <>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Assigned to {ticket.agentInfo.name || ticket.agentInfo.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status Workflow */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Progress
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between relative mb-8">
                      {[
                        { status: 'new', label: 'New' },
                        { status: 'in_progress', label: 'In Progress' },
                        { status: 'waiting_for_customer', label: 'Awaiting Customer' },
                        { status: 'waiting_for_agent', label: 'Awaiting Agent' },
                        { status: 'resolved', label: 'Resolved' },
                        { status: 'closed', label: 'Closed' }
                      ].map((step, index, array) => {
                        const currentIndex = array.findIndex(s => s.status === ticket.status);
                        const isCompleted = index < currentIndex;
                        const isCurrent = step.status === ticket.status;
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center relative z-10">
                            {/* Step Circle */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : isCurrent
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">{index + 1}</span>
                              )}
                            </div>
                            
                            {/* Step Label */}
                            <div className={`mt-2 text-xs font-medium text-center max-w-20 ${
                              isCompleted || isCurrent 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Progress Line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500 ease-out"
                          style={{
                            width: `${(([
                              'new', 'in_progress', 'waiting_for_customer', 'waiting_for_agent', 'resolved', 'closed'
                            ].findIndex(s => s === ticket.status)) / 5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <span className="font-medium">Current Status:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {ticket.status === 'new' ? 'New Ticket - Awaiting Assignment' :
                       ticket.status === 'in_progress' ? 'In Progress - Being Worked On' :
                       ticket.status === 'waiting_for_customer' ? 'Waiting for Your Response' :
                       ticket.status === 'waiting_for_agent' ? 'Waiting for Agent Response' :
                       ticket.status === 'resolved' ? 'Resolved - Ready for Review' :
                       ticket.status === 'closed' ? 'Closed - Completed' : ticket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {/* Status and Priority Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">STATUS</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.status === 'new' ? 'bg-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500' :
                        ticket.status === 'waiting_for_customer' ? 'bg-orange-500' :
                        ticket.status === 'waiting_for_agent' ? 'bg-purple-500' :
                        ticket.status === 'resolved' ? 'bg-green-500' :
                        ticket.status === 'closed' ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        ticket.status === 'new' ? 'text-blue-700 dark:text-blue-300' :
                        ticket.status === 'in_progress' ? 'text-yellow-700 dark:text-yellow-300' :
                        ticket.status === 'waiting_for_customer' ? 'text-orange-700 dark:text-orange-300' :
                        ticket.status === 'waiting_for_agent' ? 'text-purple-700 dark:text-purple-300' :
                        ticket.status === 'resolved' ? 'text-green-700 dark:text-green-300' :
                        ticket.status === 'closed' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600'
                      }`}>
                        {ticket.status === 'new' ? 'New' :
                         ticket.status === 'in_progress' ? 'In Progress' :
                         ticket.status === 'waiting_for_customer' ? 'Waiting for Customer' :
                         ticket.status === 'waiting_for_agent' ? 'Waiting for Agent' :
                         ticket.status === 'resolved' ? 'Resolved' :
                         ticket.status === 'closed' ? 'Closed' : ticket.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PRIORITY</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.priority === 'critical' ? 'bg-red-500' :
                        ticket.priority === 'high' ? 'bg-orange-500' :
                        ticket.priority === 'medium' ? 'bg-yellow-500' :
                        ticket.priority === 'low' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        ticket.priority === 'critical' ? 'text-red-700 dark:text-red-300' :
                        ticket.priority === 'high' ? 'text-orange-700 dark:text-orange-300' :
                        ticket.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                        ticket.priority === 'low' ? 'text-green-700 dark:text-green-300' : 'text-gray-600'
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>



                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Description</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <RichTextEditor
                      content={convertLegacyContent(ticket.content)}
                      editable={false}
                      className="border-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI Summary
                      </h3>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                      onClick={handleGenerateSummary}
                      disabled={generatingSummary}
                    >
                      {generatingSummary ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {ticket.aiSummary ? 'Regenerate' : 'Generate Summary'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {summaryError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{summaryError}</p>
                    </div>
                  )}
                  {ticket.aiSummary ? (
                    <div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {ticket.aiSummary}
                        </p>
                      </div>
                      {ticket.summaryGeneratedAt && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Generated on {formatFullDateTime(ticket.summaryGeneratedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No summary generated yet</p>
                      <p className="text-sm">Click the button above to generate an AI summary of this ticket.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Comments Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Activity & Comments
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({comments.length})</span>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="px-6 py-4">
                  <div className="space-y-6 mb-8">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No comments yet</p>
                        <p className="text-sm">Be the first to add a comment!</p>
                      </div>
                    ) : (
                      comments.map((comment) => {
                        const isEditing = editingCommentId === comment.id;
                        const canEdit = user?.id === comment.user.id && canEditComment(comment.createdAt);

                        return (
                          <div key={comment.id} className="flex space-x-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                            <Avatar
                              img=""
                              alt={comment.user.name || comment.user.email}
                              size="md"
                              className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {comment.user.name || comment.user.email}
                                  </span>
                                  {comment.user.role && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      comment.user.role === 'agent'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    }`}>
                                      {comment.user.role === 'agent' ? 'Agent' : 'Customer'}
                                    </span>
                                  )}
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatFullDateTime(comment.createdAt)}
                                  </span>
                                  {comment.edited && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                      (edited{comment.editCount && comment.editCount > 1 ? ` ${comment.editCount}x` : ''})
                                    </span>
                                  )}
                                </div>
                                {canEdit && !isEditing && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400" title="Time remaining to edit">
                                      {getEditTimeRemaining(comment.createdAt)}
                                    </span>
                                    <button
                                      onClick={() => handleStartEdit(comment)}
                                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                      title="Edit comment"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="space-y-3">
                                  <RichTextEditor
                                    content={editCommentContent}
                                    onChange={setEditCommentContent}
                                    className="min-h-[100px] border-2 border-blue-200 dark:border-blue-600 rounded-lg"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      size="sm"
                                      color="gray"
                                      onClick={handleCancelEdit}
                                      disabled={savingEdit}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                      onClick={() => handleSaveEdit(comment.id)}
                                      disabled={!editCommentContent.text.trim() || savingEdit}
                                    >
                                      {savingEdit ? 'Saving...' : 'Save'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                  <RichTextEditor
                                    content={convertLegacyContent(comment.content)}
                                    editable={false}
                                    className="border-none bg-transparent"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex space-x-4">
                      <Avatar
                        img=""
                        alt="You"
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Add a comment
                        </label>
                        <div className="mb-4">
                          <RichTextEditor
                            content={newComment}
                            onChange={setNewComment}
                            placeholder="Type your comment here..."
                            className="min-h-[140px] border-2 border-gray-200 dark:border-gray-600 rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            color="gray"
                            onClick={() => setNewComment(createEmptyRichText())}
                            disabled={!newComment.text.trim()}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                            onClick={handleAddComment}
                            disabled={!newComment.text.trim() || submittingComment}
                          >
                            {submittingComment ? 'Adding...' : 'Add Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Reopen Ticket Card */}
              {canReopen && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Reopen Ticket
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Need more help with this issue? You can reopen this ticket.
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      {ticket.closedAt && getReopenTimeRemaining(ticket.closedAt)}
                    </p>
                    {!showReopenForm ? (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 justify-start"
                        onClick={() => setShowReopenForm(true)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reopen Ticket
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="Why do you need to reopen this ticket? (optional)"
                          rows={3}
                          className="w-full"
                        />
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                            onClick={handleReopenTicket}
                            disabled={reopening}
                          >
                            {reopening ? 'Reopening...' : 'Confirm Reopen'}
                          </Button>
                          <Button
                            size="sm"
                            color="gray"
                            className="w-full"
                            onClick={() => {
                              setShowReopenForm(false);
                              setReopenReason('');
                            }}
                            disabled={reopening}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons Card */}
              {canModifyTicket && ticket.status !== 'closed' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {ticket.status === 'new' && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 justify-start"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updatingStatus}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Start Work
                      </Button>
                    )}
                    
                    {ticket.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 justify-start"
                          onClick={() => handleStatusUpdate('waiting_for_customer')}
                          disabled={updatingStatus}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Wait for Customer
                        </Button>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 justify-start"
                          onClick={() => handleStatusUpdate('resolved')}
                          disabled={updatingStatus}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    
                    {(ticket.status === 'waiting_for_customer' || ticket.status === 'waiting_for_agent') && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 justify-start"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updatingStatus}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Resume Work
                      </Button>
                    )}

                    {(ticket.status === 'in_progress' || ticket.status === 'resolved') && (
                      <Button
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500 justify-start"
                        onClick={() => setShowCloseForm(!showCloseForm)}
                        disabled={updatingStatus}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Ticket
                      </Button>
                    )}
                  </div>

                  {/* Close Ticket Form */}
                  {showCloseForm && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                      {/* AI Closing Suggestions Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            AI Suggestions
                          </span>
                          <Button
                            size="xs"
                            className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                            onClick={handleGenerateClosingSuggestion}
                            disabled={generatingSuggestion}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {generatingSuggestion ? 'Generating...' : 'Generate'}
                          </Button>
                        </div>

                        {closingSuggestion && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-3 border border-purple-200 dark:border-purple-800">
                            <div className="mb-2">
                              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Reason:</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {closingSuggestion.reason}
                              </p>
                            </div>
                            <div className="mb-3">
                              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Suggested Comment:</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {closingSuggestion.comment}
                              </p>
                            </div>
                            <Button
                              size="xs"
                              className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                              onClick={handleApplySuggestion}
                            >
                              Apply Suggestion
                            </Button>
                          </div>
                        )}
                      </div>

                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Closing Comment <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={closingComment}
                        onChange={(e) => setClosingComment(e.target.value)}
                        placeholder="Describe how the issue was resolved..."
                        rows={3}
                        className="w-full mb-3"
                        required
                      />
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          onClick={handleCloseTicket}
                          disabled={!closingComment.trim() || updatingStatus}
                        >
                          {updatingStatus ? 'Closing...' : 'Close Ticket'}
                        </Button>
                        <Button
                          size="sm"
                          color="gray"
                          className="w-full"
                          onClick={() => {
                            setShowCloseForm(false);
                            setClosingComment('');
                            setClosingSuggestion(null);
                          }}
                          disabled={updatingStatus}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sentiment Analysis Card - Agent Only */}
              {user?.role === 'agent' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Sentiment Analysis
                      </h3>
                      <Button
                        size="xs"
                        color="gray"
                        onClick={fetchSentiment}
                        disabled={loadingSentiment}
                      >
                        {loadingSentiment ? 'Analyzing...' : 'Analyze'}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    {sentimentData ? (
                      <div className="space-y-4">
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            TICKET SENTIMENT
                          </dt>
                          <SentimentIndicator
                            sentiment={sentimentData.ticket_sentiment.sentiment}
                            score={sentimentData.ticket_sentiment.score}
                            confidence={sentimentData.ticket_sentiment.confidence}
                            emotions={sentimentData.ticket_sentiment.emotions}
                            escalationRecommended={sentimentData.ticket_sentiment.escalation_recommended}
                            showDetails
                          />
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            OVERALL SCORE
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(sentimentData.overall_trends.average_score * 100).toFixed(0)}%
                          </dd>
                        </div>
                        {sentimentData.ticket_sentiment.escalation_recommended && (
                          <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-xs text-yellow-700 dark:text-yellow-300">
                              Escalation recommended
                            </span>
                          </div>
                        )}
                        {sentimentData.overall_trends.common_emotions.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              DETECTED EMOTIONS
                            </dt>
                            <div className="flex flex-wrap gap-1">
                              {sentimentData.overall_trends.common_emotions.slice(0, 3).map((emotion) => (
                                <span
                                  key={emotion.emotion}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                                >
                                  {emotion.emotion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            SUMMARY
                          </dt>
                          <dd className="text-xs text-gray-600 dark:text-gray-400">
                            {sentimentData.ticket_sentiment.summary}
                          </dd>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Click "Analyze" to get sentiment analysis
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Ticket Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Details
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Created</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formatFullDateTime(ticket.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Updated</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formatFullDateTime(ticket.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Reporter</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {ticket.userInfo?.name || ticket.userInfo?.email}
                      </dd>
                    </div>
                    {ticket.agentInfo && (
                      <div>
                        <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned to</dt>
                        <dd className="text-gray-900 dark:text-white">
                          {ticket.agentInfo.name || ticket.agentInfo.email}
                        </dd>
                      </div>
                    )}
                    {ticket.agentInfo && (
                      <div>
                        <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Assignment Type</dt>
                        <dd className="text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">AI Auto-assigned</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Matched by category and workload
                          </p>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Category</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {ticket.category?.name} {"->"} {ticket.subCategory?.name}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalation History Card */}
              {escalationHistory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Escalation History
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {escalationHistory.map((item) => (
                        <div key={item.id} className="border-l-2 border-orange-300 pl-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase">
                              {item.escalation_level.replace('_', ' ')}
                            </span>
                            {item.is_automatic && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                                Auto
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {item.reason}
                          </p>
                          {item.new_agent && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Assigned to: {item.new_agent.name}
                            </p>
                          )}
                          {item.new_priority && item.previous_priority && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Priority: {item.previous_priority} → {item.new_priority}
                            </p>
                          )}
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatFullDateTime(item.escalated_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conflict Resolution Modal */}
        <Modal show={showConflictModal} onClose={() => setShowConflictModal(false)}>
          <Modal.Header>
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span>Update Conflict Detected</span>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {conflictInfo?.message}
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Your version:</span>
                  <span className="font-medium">{conflictInfo?.yourVersion}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current version:</span>
                  <span className="font-medium">{conflictInfo?.currentVersion}</span>
                </div>
                {conflictInfo?.currentStatus && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current status:</span>
                    <span className="font-medium">{conflictInfo.currentStatus}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Another user has made changes to this ticket. Please refresh to see the latest changes before making your update.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end space-x-3 w-full">
              <Button
                color="gray"
                onClick={() => setShowConflictModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                onClick={handleRefreshAndRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh & Review
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}