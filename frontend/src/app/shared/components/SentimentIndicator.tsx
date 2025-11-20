'use client';

import { Tooltip } from 'flowbite-react';
import { ThumbsUp, ThumbsDown, Minus, AlertTriangle } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence?: number;
  emotions?: string[];
  escalationRecommended?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SentimentIndicator({
  sentiment,
  score,
  confidence,
  emotions = [],
  escalationRecommended = false,
  showDetails = false,
  size = 'md',
  className = '',
}: SentimentIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentBgColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className={sizeClasses[size]} />;
      case 'negative':
        return <ThumbsDown className={sizeClasses[size]} />;
      default:
        return <Minus className={sizeClasses[size]} />;
    }
  };

  const getSentimentLabel = () => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
    }
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(0) + '%';
  };

  const tooltipContent = (
    <div className="text-sm">
      <div className="font-semibold mb-1">{getSentimentLabel()} Sentiment</div>
      <div>Score: {formatScore(score)}</div>
      {confidence !== undefined && (
        <div>Confidence: {formatScore(confidence)}</div>
      )}
      {emotions.length > 0 && (
        <div className="mt-1">
          <span className="font-medium">Emotions:</span>{' '}
          {emotions.join(', ')}
        </div>
      )}
      {escalationRecommended && (
        <div className="mt-1 text-yellow-400 font-medium">
          Escalation Recommended
        </div>
      )}
    </div>
  );

  const indicator = (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`inline-flex items-center justify-center rounded-full p-1.5 ${getSentimentBgColor()} ${getSentimentColor()}`}
      >
        {getSentimentIcon()}
      </div>
      {showDetails && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getSentimentColor()}`}>
            {getSentimentLabel()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatScore(score)}
          </span>
        </div>
      )}
      {escalationRecommended && (
        <Tooltip content="Escalation Recommended">
          <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" />
        </Tooltip>
      )}
    </div>
  );

  if (!showDetails) {
    return <Tooltip content={tooltipContent}>{indicator}</Tooltip>;
  }

  return indicator;
}

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  className?: string;
}

export function SentimentBadge({ sentiment, className = '' }: SentimentBadgeProps) {
  const getBadgeClasses = () => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses()} ${className}`}
    >
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

interface SentimentScoreBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function SentimentScoreBar({
  score,
  showLabel = true,
  className = '',
}: SentimentScoreBarProps) {
  // Convert score from -1 to 1 range to 0 to 100 for display
  const normalizedScore = ((score + 1) / 2) * 100;

  const getBarColor = () => {
    if (score > 0.3) return 'bg-green-500';
    if (score < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-500">Negative</span>
          <span className="text-gray-500">Neutral</span>
          <span className="text-green-500">Positive</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className={`${getBarColor()} transition-all duration-300`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
