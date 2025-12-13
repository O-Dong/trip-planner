import { useMemo, useState } from 'react';
import { useTripContext } from '../../contexts/TripContext';
import { useTripDuration } from '../../hooks/useTripDuration';
import { calculateItineraryStats } from '../../utils/routeOptimizer';
import type { PlaceCategory } from '../../types';

function ItineraryView() {
  const { 
    tripInfo, 
    itinerary, 
    selectedDay, 
    setSelectedDay, 
    resetTrip,
    movePlaceInDay,
    movePlaceBetweenDays,
    removePlaceFromItinerary
  } = useTripContext();
  const { duration } = useTripDuration(tripInfo.startDate, tripInfo.endDate);
  
  const [editMode, setEditMode] = useState(false);
  const [movingPlace, setMovingPlace] = useState<{ dayIndex: number; placeIndex: number } | null>(null);

  const stats = useMemo(() => {
    if (!itinerary) return null;
    return calculateItineraryStats(itinerary);
  }, [itinerary]);

  const handleDayClick = (index: number) => {
    setSelectedDay(index);
  };

  const handleMoveUp = (placeIndex: number) => {
    if (placeIndex > 0) {
      movePlaceInDay(selectedDay, placeIndex, placeIndex - 1);
    }
  };

  const handleMoveDown = (placeIndex: number) => {
    if (!itinerary) return;
    if (placeIndex < itinerary[selectedDay].length - 1) {
      movePlaceInDay(selectedDay, placeIndex, placeIndex + 1);
    }
  };

  const handleStartMove = (placeIndex: number) => {
    setMovingPlace({ dayIndex: selectedDay, placeIndex });
  };

  const handleMoveToDay = (targetDay: number) => {
    if (!movingPlace) return;
    
    if (movingPlace.dayIndex !== targetDay) {
      movePlaceBetweenDays(movingPlace.dayIndex, targetDay, movingPlace.placeIndex);
      setSelectedDay(targetDay);
    }
    setMovingPlace(null);
  };

  const handleRemovePlace = (placeIndex: number) => {
    if (window.confirm('이 장소를 일정에서 삭제하시겠습니까?')) {
      removePlaceFromItinerary(selectedDay, placeIndex);
    }
  };

  const getCategoryEmoji = (category: PlaceCategory) => {
    const emojis: Record<PlaceCategory, string> = {
      관광: '🏛️',
      식사: '🍽️',
      쇼핑: '🛍️',
      카페: '☕',
      기타: '📍',
    };
    return emojis[category];
  };

  if (!itinerary) return null;

  const currentDayPlaces = itinerary[selectedDay] || [];

  return (
    <div className="space-y-6">
      {/* 여행 정보 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 text-center">
        <h2 className="text-xl font-title text-gray-800 mb-1">{tripInfo.name}</h2>
        {duration && stats && (
          <>
            <p className="text-sm text-gray-600">
              {duration.nights}박 {duration.days}일 · 총 {stats.total.places}개 장소
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {tripInfo.startDate} ~ {tripInfo.endDate}
            </p>
          </>
        )}
      </div>

      {/* 성공 메시지 + 통계 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-700 font-medium text-sm mb-1">
          ✅ 여행 일정이 완성되었습니다!
        </p>
        <p className="text-green-600 text-xs">
          완성된 일정을 확인하고, 자유롭게 수정해보세요
        </p>
        {stats && stats.total.distance > 0 && (
          <p className="text-green-600 text-xs mt-1">
            총 이동 거리: 약 {stats.total.distance}km
          </p>
        )}
      </div>

      {/* 편집 모드 토글 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">일정 관리</h3>
        <button
          onClick={() => {
            setEditMode(!editMode);
            setMovingPlace(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            editMode
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {editMode ? '편집 완료' : '편집 모드'}
        </button>
      </div>

      {/* 날짜 이동 UI (편집 모드일 때만) */}
      {editMode && movingPlace && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 font-medium text-sm mb-2">
            📍 이동할 날짜를 선택하세요
          </p>
          <div className="grid grid-cols-3 gap-2">
            {itinerary.map((_, index) => (
              <button
                key={index}
                onClick={() => handleMoveToDay(index)}
                disabled={index === movingPlace.dayIndex}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  index === movingPlace.dayIndex
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-400'
                }`}
              >
                {index + 1}일차로 이동
              </button>
            ))}
          </div>
          <button
            onClick={() => setMovingPlace(null)}
            className="w-full mt-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            취소
          </button>
        </div>
      )}

      {/* 일자 탭 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">날짜 선택</h3>
        <div className="grid grid-cols-3 gap-2">
          {itinerary.map((dayPlaces, index) => {
            const dayStats = stats?.perDay[index];
            return (
              <button
                key={index}
                onClick={() => handleDayClick(index)}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedDay === index
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">{index + 1}일차</div>
                <div className="text-xs mt-1 opacity-80">
                  {dayPlaces.length}개 장소
                </div>
                {dayStats && dayStats.totalDistance > 0 && (
                  <div className="text-xs mt-0.5 opacity-70">
                    {dayStats.totalDistance}km
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 장소 리스트 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {selectedDay + 1}일차 일정
        </h3>

        {currentDayPlaces.length > 0 ? (
          <div className="space-y-3">
            {currentDayPlaces.map((place, index) => (
              <div
                key={place.id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  movingPlace?.dayIndex === selectedDay && movingPlace?.placeIndex === index
                    ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      {getCategoryEmoji(place.category)} {place.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {place.address}
                    </p>
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {place.category}
                      </span>
                    </div>
                  </div>

                  {/* 편집 버튼들 */}
                  {editMode && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="위로"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === currentDayPlaces.length - 1}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="아래로"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleStartMove(index)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                        title="다른 날로 이동"
                      >
                        📅
                      </button>
                      <button
                        onClick={() => handleRemovePlace(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm">이 날은 비어있습니다</p>
          </div>
        )}
      </div>

      {/* 처음으로 버튼 */}
      <button
        onClick={resetTrip}
        className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
      >
        새로운 여행 계획하기
      </button>
    </div>
  );
}

export default ItineraryView;