import { useTripContext } from '../../contexts/TripContext';
import { useTripDuration } from '../../hooks/useTripDuration';

function StepTwo() {
  const { tripInfo, updateTripInfo, nextStep, prevStep } = useTripContext();
  const { duration, warning, isValid } = useTripDuration(tripInfo.startDate, tripInfo.endDate);

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
            value={tripInfo.startDate}
            onChange={(e) => updateTripInfo('startDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            종료일
          </label>
          <input
            type="date"
            value={tripInfo.endDate}
            onChange={(e) => updateTripInfo('endDate', e.target.value)}
            min={tripInfo.startDate}
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
          onClick={prevStep}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={nextStep}
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