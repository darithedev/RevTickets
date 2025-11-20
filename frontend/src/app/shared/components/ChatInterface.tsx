'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, TextInput, Card } from 'flowbite-react';
import { Send, Bot, User, FileText, Ticket, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { ChatMessage } from '../../../hooks/useChatHistory';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  onCreateTicket?: () => void;
  placeholder?: string;
  showCreateTicket?: boolean;
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onClearHistory,
  onCreateTicket,
  placeholder = 'Ask a question about our knowledge base...',
  showCreateTicket = true
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-gray-900 dark:text-white">KB Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          {showCreateTicket && messages.length > 0 && onCreateTicket && (
            <Button
              size="xs"
              color="light"
              onClick={onCreateTicket}
              className="flex items-center"
            >
              <Ticket className="h-3 w-3 mr-1" />
              Create Ticket
            </Button>
          )}
          {messages.length > 0 && (
            <Button
              size="xs"
              color="light"
              onClick={onClearHistory}
              className="flex items-center"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">
              Ask me anything about our knowledge base!
              <br />
              <span className="text-sm">I can help you find articles and answers.</span>
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-medium mb-1 opacity-75">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source) => (
                            <Link
                              key={source.id}
                              href={`/knowledge-base/${source.id}`}
                              className="flex items-center text-xs hover:underline opacity-90"
                            >
                              <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                              {source.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested actions */}
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.suggestedActions.map((action, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 opacity-75"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs mt-1 opacity-50">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Searching knowledge base...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <TextInput
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;
