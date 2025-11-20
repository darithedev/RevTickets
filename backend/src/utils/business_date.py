from datetime import datetime, timedelta, date
from typing import List, Optional


# Default holidays (US Federal Holidays for 2024-2025)
DEFAULT_HOLIDAYS = [
    # 2024 Holidays
    date(2024, 1, 1),    # New Year's Day
    date(2024, 1, 15),   # Martin Luther King Jr. Day
    date(2024, 2, 19),   # Presidents Day
    date(2024, 5, 27),   # Memorial Day
    date(2024, 6, 19),   # Juneteenth
    date(2024, 7, 4),    # Independence Day
    date(2024, 9, 2),    # Labor Day
    date(2024, 10, 14),  # Columbus Day
    date(2024, 11, 11),  # Veterans Day
    date(2024, 11, 28),  # Thanksgiving
    date(2024, 12, 25),  # Christmas
    # 2025 Holidays
    date(2025, 1, 1),    # New Year's Day
    date(2025, 1, 20),   # Martin Luther King Jr. Day
    date(2025, 2, 17),   # Presidents Day
    date(2025, 5, 26),   # Memorial Day
    date(2025, 6, 19),   # Juneteenth
    date(2025, 7, 4),    # Independence Day
    date(2025, 9, 1),    # Labor Day
    date(2025, 10, 13),  # Columbus Day
    date(2025, 11, 11),  # Veterans Day
    date(2025, 11, 27),  # Thanksgiving
    date(2025, 12, 25),  # Christmas
]


def is_business_day(check_date: date, holidays: Optional[List[date]] = None) -> bool:
    """
    Check if a given date is a business day.
    
    A business day is:
    - Not a weekend (Saturday or Sunday)
    - Not a holiday
    
    Args:
        check_date: The date to check
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        True if the date is a business day, False otherwise
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    # Check if it's a weekend (Monday = 0, Sunday = 6)
    if check_date.weekday() >= 5:
        return False
    
    # Check if it's a holiday
    if check_date in holidays:
        return False
    
    return True


def add_business_days(start_date: datetime, business_days: int, holidays: Optional[List[date]] = None) -> datetime:
    """
    Add a number of business days to a start date.
    
    Args:
        start_date: The starting datetime
        business_days: Number of business days to add
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        The resulting datetime after adding business days
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    current_date = start_date
    days_added = 0
    
    while days_added < business_days:
        current_date += timedelta(days=1)
        if is_business_day(current_date.date(), holidays):
            days_added += 1
    
    return current_date


def subtract_business_days(start_date: datetime, business_days: int, holidays: Optional[List[date]] = None) -> datetime:
    """
    Subtract a number of business days from a start date.
    
    Args:
        start_date: The starting datetime
        business_days: Number of business days to subtract
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        The resulting datetime after subtracting business days
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    current_date = start_date
    days_subtracted = 0
    
    while days_subtracted < business_days:
        current_date -= timedelta(days=1)
        if is_business_day(current_date.date(), holidays):
            days_subtracted += 1
    
    return current_date


def count_business_days(start_date: datetime, end_date: datetime, holidays: Optional[List[date]] = None) -> int:
    """
    Count the number of business days between two dates (exclusive of start, inclusive of end).
    
    Args:
        start_date: The start datetime
        end_date: The end datetime
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        Number of business days between the two dates
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    if end_date <= start_date:
        return 0
    
    count = 0
    current_date = start_date + timedelta(days=1)
    
    while current_date <= end_date:
        if is_business_day(current_date.date(), holidays):
            count += 1
        current_date += timedelta(days=1)
    
    return count


def get_business_hours_remaining(
    start_date: datetime,
    end_date: datetime,
    business_start_hour: int = 9,
    business_end_hour: int = 17,
    holidays: Optional[List[date]] = None
) -> float:
    """
    Calculate the business hours remaining between two datetimes.
    
    Args:
        start_date: The start datetime
        end_date: The end datetime
        business_start_hour: Start of business day (default 9 AM)
        business_end_hour: End of business day (default 5 PM)
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        Number of business hours between the two datetimes
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    if end_date <= start_date:
        return 0.0
    
    total_hours = 0.0
    current_date = start_date
    hours_per_day = business_end_hour - business_start_hour
    
    while current_date.date() <= end_date.date():
        if is_business_day(current_date.date(), holidays):
            day_start = current_date.replace(hour=business_start_hour, minute=0, second=0, microsecond=0)
            day_end = current_date.replace(hour=business_end_hour, minute=0, second=0, microsecond=0)
            
            # Adjust for the actual start time on the first day
            if current_date.date() == start_date.date():
                if current_date.hour < business_start_hour:
                    effective_start = day_start
                elif current_date.hour >= business_end_hour:
                    current_date = (current_date + timedelta(days=1)).replace(
                        hour=0, minute=0, second=0, microsecond=0
                    )
                    continue
                else:
                    effective_start = current_date
            else:
                effective_start = day_start
            
            # Adjust for the actual end time on the last day
            if current_date.date() == end_date.date():
                if end_date.hour <= business_start_hour:
                    effective_end = day_start
                elif end_date.hour >= business_end_hour:
                    effective_end = day_end
                else:
                    effective_end = end_date
            else:
                effective_end = day_end
            
            # Calculate hours for this day
            if effective_end > effective_start:
                hours = (effective_end - effective_start).total_seconds() / 3600
                total_hours += min(hours, hours_per_day)
        
        current_date = (current_date + timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
    
    return total_hours


def next_business_day(from_date: datetime, holidays: Optional[List[date]] = None) -> datetime:
    """
    Get the next business day from a given date.
    
    Args:
        from_date: The starting datetime
        holidays: List of holiday dates to exclude. Uses DEFAULT_HOLIDAYS if None.
    
    Returns:
        The next business day datetime
    """
    if holidays is None:
        holidays = DEFAULT_HOLIDAYS
    
    next_date = from_date + timedelta(days=1)
    
    while not is_business_day(next_date.date(), holidays):
        next_date += timedelta(days=1)
    
    return next_date
