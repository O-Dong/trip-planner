import type { TripInfo } from "../../types";

interface StepTwoProps {
  startDate: string;
  endDate: string;
  onUpdate: (key: keyof TripInfo, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

function StepTwo({ startDate, endDate, onUpdate, onNext, onPrev }: StepTwoProps) {
  const calculateDuration = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = diffDays - 1;
    
    return { nights, days: diffDays };
  };

  const getWarningMessage = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const duration = calculateDuration();
    
    // 종료일이 시작일보다 빠른 경우
    if (end < start) {
      return {
        type: 'error',
        message: '⚡ 혹시 초능력자? 종료일이 시작일보다 빠릅니다!'
      };
    }
    
    // 당일치기인 경우
    if (duration && duration.nights === 0) {
      return {
        type: 'warning',
        message: '⚡ 당일치기 여행이시네요! 바쁘게 움직일 준비 되셨나요?'
      };
    }
    
    // 너무 긴 여행인 경우 (30일 이상)
    if (duration && duration.days > 30) {
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
  };

  const duration = calculateDuration();
  const warning = getWarningMessage();
  const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

  const getWarningStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-300 text-red-700';
      case 'warning':
        return 'bg-orange-50 border-orange-300 text-orange-700';
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          일정을 선택해주세요
        </h2>
        <p className="text-sm text-gray-500">
          여행 시작일과 종료일을 선택하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시작일
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onUpdate('startDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            종료일
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onUpdate('endDate', e.target.value)}
            min={startDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* 경고 메시지 */}
      {warning && (
        <div className={`p-4 rounded-lg border ${getWarningStyle(warning.type)} animate-pulse`}>
          <p className="font-medium text-sm">
            {warning.message}
          </p>
        </div>
      )}

      {/* 정상 여행 기간 표시 */}
      {duration && !warning && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 font-medium">
            {duration.nights}박 {duration.days}일 일정이군요!
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default StepTwo;