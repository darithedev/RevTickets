'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLAIndicatorProps {
  slaDueDate?: string;
  slaBreached: boolean;
  status: string;
  className?: string;
}

export function SLAIndicator({ slaDueDate, slaBreached, status, className = '' }: SLAIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'safe' | 'warning' | 'critical' | 'breached'>('safe');

  useEffect(() => {
    if (!slaDueDate) return;

    const calculateTimeRemaining = () => {
      // Don't show countdown for closed/resolved tickets
      if (status === 'closed' || status === 'resolved') {
        if (slaBreached) {
          setUrgencyLevel('breached');
          setTimeRemaining('Breached');
        } else {
          setUrgencyLevel('safe');
          setTimeRemaining('Met');
        }
        return;
      }

      // If already breached, show breached status
      if (slaBreached) {
        setUrgencyLevel('breached');
        const now = new Date();
        const due = new Date(slaDueDate);
        const diff = now.getTime() - due.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m overdue`);
        return;
      }

      // If paused (waiting for customer), show paused
      if (status === 'waiting_for_customer') {
        const now = new Date();
        const due = new Date(slaDueDate);
        const diff = due.getTime() - now.getTime();

        if (diff <= 0) {
          setUrgencyLevel('breached');
          setTimeRemaining('Breached');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m (paused)`);
          setUrgencyLevel('safe');
        }
        return;
      }

      const now = new Date();
      const due = new Date(slaDueDate);
      const diff = due.getTime() - now.getTime();

      if (diff <= 0) {
        setUrgencyLevel('breached');
        const overdue = Math.abs(diff);
        const hours = Math.floor(overdue / (1000 * 60 * 60));
        const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m overdue`);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Set urgency level based on remaining time
        if (hours < 1) {
          setUrgencyLevel('critical');
        } else if (hours < 4) {
          setUrgencyLevel('warning');
        } else {
          setUrgencyLevel('safe');
        }

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          setTimeRemaining(`${days}d ${remainingHours}h`);
        } else {
          setTimeRemaining(`${hours}h ${minutes}m`);
        }
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [slaDueDate, slaBreached, status]);

  if (!slaDueDate) {
    return null;
  }

  const getIndicatorStyles = () => {
    switch (urgencyLevel) {
      case 'breached':
        return {
          container: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'critical':
        return {
          container: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
          text: 'text-orange-800 dark:text-orange-200',
          icon: 'text-orange-600 dark:text-orange-400'
        };
      case 'warning':
        return {
          container: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'safe':
      default:
        return {
          container: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
          icon: 'text-green-600 dark:text-green-400'
        };
    }
  };

  const styles = getIndicatorStyles();

  const getIcon = () => {
    switch (urgencyLevel) {
      case 'breached':
        return <AlertTriangle className={`h-4 w-4 ${styles.icon}`} />;
      case 'critical':
      case 'warning':
        return <Clock className={`h-4 w-4 ${styles.icon}`} />;
      case 'safe':
      default:
        return <CheckCircle className={`h-4 w-4 ${styles.icon}`} />;
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${styles.container} ${className}`}>
      {getIcon()}
      <div>
        <div className={`text-xs font-medium ${styles.text}`}>
          SLA {urgencyLevel === 'breached' ? 'Breached' : 'Due'}
        </div>
        <div className={`text-sm font-bold ${styles.text}`}>
          {timeRemaining}
        </div>
      </div>
    </div>
  );
}

export default SLAIndicator;
