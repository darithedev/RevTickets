import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};

export const formatFullDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Backend sends UTC timestamps. We need to parse them correctly.
      // If the string doesn't have timezone info, we assume it's UTC
      if (!date.includes('Z') && !date.includes('+') && !date.includes('-', 10)) {
        // No timezone indicator, assume UTC and append 'Z'
        dateObj = new Date(date + 'Z');
      } else {
        // Has timezone indicator, parse normally
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    // Format the date in the user's local timezone
    // The browser automatically converts UTC to local time
    return format(dateObj, 'MMM dd, yyyy \'at\' h:mm a');
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};