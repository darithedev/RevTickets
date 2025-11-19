import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

export const formatFullDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'string') {
      // Parse ISO string - this automatically handles UTC conversion to local time
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';

    return format(dateObj, 'MMM dd, yyyy \'at\' h:mm a');
  } catch {
    return 'Invalid date';
  }
};