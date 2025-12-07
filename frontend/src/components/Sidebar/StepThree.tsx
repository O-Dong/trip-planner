import type { Place, TripInfo } from "../../types";

interface StepThreeProps {
  tripInfo: TripInfo;
  places: Place[];
  onPrev: () => void;
}

function StepThree({ tripInfo, places, onPrev }: StepThreeProps) {
  const calculateDuration = () => {
    const start = new Date(tripInfo.startDate);
    const end = new Date(tripInfo.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = diffDays - 1;
    return { nights, days: diffDays };
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      {/* 여행 정보 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-bold text-gray-800 mb-1">{tripInfo.name}</h2>
        <p className="text-sm text-gray-600">
          {duration.nights}박 {duration.days}일
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {tripInfo.startDate} ~ {tripInfo.endDate}
        </p>
      </div>

      {/* 안내 메시지 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          "{tripInfo.name}" 일정을 시작해볼까요?
        </h3>
        <p className="text-sm text-gray-500">
          지도에서 장소를 검색하거나 직접 추가해보세요
        </p>
      </div>

      {/* 장소 추가 영역 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-400">
          장소 검색 기능이 곧 추가될 예정
        </p>
      </div>

      {/* 임시 장소 리스트 */}
      {places.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">추가된 장소</h4>
          <div className="space-y-2">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <p className="font-medium text-gray-800">{place.name}</p>
                <p className="text-xs text-gray-500">{place.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          disabled
          className="flex-1 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
        >
          여행 만들기
        </button>
      </div>
    </div>
  );
}

export default StepThree;