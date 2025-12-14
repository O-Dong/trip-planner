export interface TripDuration {
  nights: number;
  days: number;
}

export function calculateTripDuration(startDate: string, endDate: string): TripDuration | null {
  if (!startDate || !endDate) return null;

  // 타임존 이슈 방지: 시간을 00:00:00으로 정규화
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // 일수 계산 (Math.floor 사용으로 정확도 향상)
  const diffTime = end.getTime() - start.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1;

  return { nights, days };
}

export interface DateWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export function validateDates(startDate: string, endDate: string): DateWarning | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const duration = calculateTripDuration(startDate, endDate);
  if (!duration) return null;

  // 종료일이 시작일보다 빠른 경우
  if (end < start) {
    return {
      type: 'error',
      message: '⚡ 혹시 초능력자? 종료일이 시작일보다 빠릅니다!'
    };
  }

  // 당일치기인 경우
  if (duration.nights === 0) {
    return {
      type: 'warning',
      message: '⚡ 당일치기 여행이시네요! 바쁘게 움직일 준비 되셨나요?'
    };
  }

  // 너무 긴 여행인 경우 (30일 이상)
  if (duration.days > 30) {
    return {
      type: 'warning',
      message: `⚡ ${duration.nights}박 여행이라니! 정말 이렇게 떠나는 거 맞나요?`
    };
  }

  // 과거 날짜로 여행인 경우
  if (start < today) {
    return {
      type: 'info',
      message: '⚡ 과거로의 여행이네요! 추억을 정리하시는 건가요?'
    };
  }

  // 1년 이상 후의 여행인 경우
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  if (start > oneYearLater) {
    return {
      type: 'info',
      message: '⚡ 꽤 먼 미래의 여행이네요! 계획형 인간이시군요!'
    };
  }

  return null;
}