import { useMemo } from 'react';
import { calculateTripDuration, validateDates } from '../utils/dateUtils';
import type { TripDuration, DateWarning } from '../utils/dateUtils';

interface UseTripDurationReturn {
  duration: TripDuration | null;
  warning: DateWarning | null;
  isValid: boolean;
}

export function useTripDuration(startDate: string, endDate: string): UseTripDurationReturn {
  const duration = useMemo(() => {
    return calculateTripDuration(startDate, endDate);
  }, [startDate, endDate]);

  const warning = useMemo(() => {
    return validateDates(startDate, endDate);
  }, [startDate, endDate]);

  const isValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }, [startDate, endDate]);

  return { duration, warning, isValid };
}