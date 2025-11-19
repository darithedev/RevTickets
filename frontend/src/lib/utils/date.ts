import { format, parseISO, formatDistanceToNow, differenceInHours, differenceInMinutes, addBusinessDays, differenceInBusinessDays, isWeekend } from 'date-fns';

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
      // Parse ISO string - this automatically handles UTC conversion to local time
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    // The format function automatically uses the local timezone
    // Remove debug logging for production
    return format(dateObj, 'MMM dd, yyyy \'at\' h:mm a');
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};

// Comment editing time limit functions (24 hours)
export const canEditComment = (createdAt: string): boolean => {
  if (!createdAt) return false;
  try {
    const dateObj = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
    if (isNaN(dateObj.getTime())) return false;
    const hoursSinceCreation = differenceInHours(new Date(), dateObj);
    return hoursSinceCreation < 24;
  } catch (error) {
    console.error('Edit time check error:', error);
    return false;
  }
};

export const getEditTimeRemaining = (createdAt: string): string => {
  if (!createdAt) return 'N/A';
  try {
    const dateObj = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
    if (isNaN(dateObj.getTime())) return 'N/A';

    const now = new Date();
    const editDeadline = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);

    if (now >= editDeadline) return 'Edit window expired';

    const hoursRemaining = differenceInHours(editDeadline, now);
    const minutesRemaining = differenceInMinutes(editDeadline, now) % 60;

    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m remaining`;
    }
    return `${minutesRemaining}m remaining`;
  } catch (error) {
    console.error('Edit time remaining error:', error);
    return 'N/A';
  }
};

// Ticket reopening functions (10 business days)
export const canReopenTicket = (closedAt: string): boolean => {
  if (!closedAt) return false;
  try {
    const dateObj = typeof closedAt === 'string' ? parseISO(closedAt) : closedAt;
    if (isNaN(dateObj.getTime())) return false;
    const businessDaysSinceClosure = differenceInBusinessDays(new Date(), dateObj);
    return businessDaysSinceClosure < 10;
  } catch (error) {
    console.error('Reopen time check error:', error);
    return false;
  }
};

export const getReopenTimeRemaining = (closedAt: string): string => {
  if (!closedAt) return 'N/A';
  try {
    const dateObj = typeof closedAt === 'string' ? parseISO(closedAt) : closedAt;
    if (isNaN(dateObj.getTime())) return 'N/A';

    const reopenDeadline = addBusinessDays(dateObj, 10);
    const now = new Date();

    if (now >= reopenDeadline) return 'Reopen window expired';

    const businessDaysRemaining = differenceInBusinessDays(reopenDeadline, now);

    if (businessDaysRemaining > 1) {
      return `${businessDaysRemaining} business days remaining`;
    } else if (businessDaysRemaining === 1) {
      return '1 business day remaining';
    }
    return 'Last day to reopen';
  } catch (error) {
    console.error('Reopen time remaining error:', error);
    return 'N/A';
  }
};

export const formatBusinessDaysFromNow = (days: number): string => {
  const futureDate = addBusinessDays(new Date(), days);
  return format(futureDate, 'MMM dd, yyyy');
};