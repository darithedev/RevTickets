'use client';

import { useState, useCallback } from 'react';
import { Button, Card, Modal } from 'flowbite-react';
import { ArrowLeft, MessageSquare, History } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { ChatInterface } from '../../../src/app/shared/components/ChatInterface';
import { useChatHistory } from '../../../src/hooks/useChatHistory';
import { kbChatApi } from '../../../src/lib/api/kb-chat';
import type { TicketSuggestion } from '../../../src/lib/api/kb-chat';

export default function KBChatPage() {
  const router = useRouter();
  const {
    messages,
    currentSessionId,
    sessions,
    isLoading,
    setIsLoading,
    addMessage,
    clearHistory,
    startNewSession,
    switchSession,
    deleteSession,
    getApiHistory
  } = useChatHistory();

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSuggestion, setTicketSuggestion] = useState<TicketSuggestion | null>(null);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    addMessage('user', content);
    setIsLoading(true);

    try {
      // Get chat history for API
      const history = getApiHistory();

      // Send to API
      const response = await kbChatApi.chat({
        query: content,
        chat_history: history,
        session_id: currentSessionId
      });

      // Add assistant response
      addMessage(
        'assistant',
        response.answer,
        response.sources,
        response.suggested_actions
      );
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(
        'assistant',
        'Sorry, I encountered an error while searching the knowledge base. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, getApiHistory, currentSessionId, setIsLoading]);

  const handleCreateTicket = useCallback(async () => {
    if (messages.length === 0) return;

    setIsLoading(true);
    try {
      const history = getApiHistory();
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();

      const suggestion = await kbChatApi.suggestTicket({
        chat_history: history,
        user_query: lastUserMessage?.content || ''
      });

      setTicketSuggestion(suggestion);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Error generating ticket suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, getApiHistory, setIsLoading]);

  const handleConfirmTicket = () => {
    if (ticketSuggestion) {
      // Navigate to create ticket page with pre-filled data
      const params = new URLSearchParams({
        title: ticketSuggestion.title,
        description: ticketSuggestion.description,
        priority: ticketSuggestion.priority
      });
      router.push(`/tickets/create?${params.toString()}`);
    }
    setShowTicketModal(false);
  };

  const formatSessionDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="h-[calc(100vh-12rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/knowledge-base">
                <Button color="light" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to KB
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chat with Knowledge Base
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask questions and get answers from our articles
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                color="light"
                size="sm"
                onClick={() => setShowSessionsPanel(!showSessionsPanel)}
              >
                <History className="h-4 w-4 mr-2" />
                Sessions
              </Button>
              <Button
                color="light"
                size="sm"
                onClick={startNewSession}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Sessions panel */}
            {showSessionsPanel && (
              <Card className="w-64 flex-shrink-0 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Chat Sessions
                </h3>
                {sessions.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No previous sessions
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-2 rounded cursor-pointer text-sm ${
                          session.id === currentSessionId
                            ? 'bg-orange-100 dark:bg-orange-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => switchSession(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatSessionDate(session.updatedAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            &times;
                          </button>
                        </div>
                        <p className="text-xs truncate mt-1">
                          {session.messages[0]?.content || 'Empty session'}
                        </p>
                        <span className="text-xs text-gray-400">
                          {session.messages.length} messages
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Chat interface */}
            <Card className="flex-1 flex flex-col min-h-0 p-0">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onClearHistory={clearHistory}
                onCreateTicket={handleCreateTicket}
                showCreateTicket={true}
              />
            </Card>
          </div>
        </div>

        {/* Ticket creation modal */}
        <Modal show={showTicketModal} onClose={() => setShowTicketModal(false)}>
          <Modal.Header>Create Support Ticket</Modal.Header>
          <Modal.Body>
            {ticketSuggestion && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on your conversation, we suggest creating a ticket with the following details:
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Title
                    </label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {ticketSuggestion.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Description
                    </label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {ticketSuggestion.description}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Priority
                      </label>
                      <p className="text-gray-700 dark:text-gray-300">
                        {ticketSuggestion.priority}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Suggested Category
                      </label>
                      <p className="text-gray-700 dark:text-gray-300">
                        {ticketSuggestion.suggested_category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleConfirmTicket}
            >
              Continue to Create Ticket
            </Button>
            <Button color="gray" onClick={() => setShowTicketModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
