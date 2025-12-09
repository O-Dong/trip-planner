import { useState } from 'react';
import { useTripContext } from '../../contexts/TripContext';
import { useSearch } from '../../hooks/useSearch';
import { useTripDuration } from '../../hooks/useTripDuration';
import { getPlaceName, hasProperName } from '../../utils/nominatim';
import { distributeByDays } from '../../utils/routeOptimizer';
import AddPlaceModal from './AddPlaceModal';
import type { Place, PlaceCategory, NominatimResult } from '../../types';

function StepThree() {
  const { 
    tripInfo, 
    places, 
    addPlace, 
    removePlace, 
    setItinerary, 
    setSelectedDay,
    setCurrentStep,
    prevStep 
  } = useTripContext();
  
  const { duration } = useTripDuration(tripInfo.startDate, tripInfo.endDate);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    error,
    performSearch,
    clearResults,
  } = useSearch();

  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<NominatimResult | null>(null);

  const handleSearch = () => {
    performSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleSelectPlace = (result: NominatimResult) => {
    const placeName = getPlaceName(result);

    // 적절한 이름이 있으면 바로 추가
    if (hasProperName(result)) {
      const newPlace: Place = {
        id: `place-${Date.now()}-${Math.random()}`,
        name: placeName,
        category: '관광',
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
      };
      addPlace(newPlace);
      clearResults();
    } else {
      // 이름이 애매하면 모달로 확인
      setSelectedResult(result);
      setShowModal(true);
    }
  };

  const handleModalConfirm = (name: string, category: PlaceCategory) => {
    if (selectedResult) {
      const newPlace: Place = {
        id: `place-${Date.now()}-${Math.random()}`,
        name,
        category,
        lat: parseFloat(selectedResult.lat),
        lng: parseFloat(selectedResult.lon),
        address: selectedResult.display_name,
      };
      addPlace(newPlace);
      setShowModal(false);
      setSelectedResult(null);
      clearResults();
    }
  };

  const handleCreateItinerary = () => {
    if (!duration || places.length === 0) return;

    // 알고리즘으로 일정 생성
    const generatedItinerary = distributeByDays(places, duration.days);
    setItinerary(generatedItinerary);
    setSelectedDay(0);
    setCurrentStep(4);
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

  return (
    <div className="space-y-6">
      {/* 여행 정보 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-bold text-gray-800 mb-1">{tripInfo.name}</h2>
        {duration && (
          <>
            <p className="text-sm text-gray-600">
              {duration.nights}박 {duration.days}일
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {tripInfo.startDate} ~ {tripInfo.endDate}
            </p>
          </>
        )}
      </div>

      {/* 안내 메시지 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">장소를 추가해주세요</h3>
        <p className="text-sm text-gray-500">검색창에 장소명이나 주소를 입력하세요</p>
      </div>

      {/* 검색 영역 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: 도쿄 타워, 신주쿠 역"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {hasSearched && searchResults.length === 0 && !error && (
          <div className="border border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <p className="text-gray-700 font-medium mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-500">다른 키워드로 다시 검색해보세요!</p>
          </div>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectPlace(result)}
                className="w-full p-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition-colors"
              >
                <p className="font-medium text-gray-800 text-sm">
                  {getPlaceName(result)}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {result.display_name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 추가된 장소 리스트 */}
      {places.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">추가된 장소 ({places.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">
                    {getCategoryEmoji(place.category)} {place.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{place.address}</p>
                </div>
                <button
                  onClick={() => removePlace(place.id)}
                  className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleCreateItinerary}
          disabled={places.length === 0}
          className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          여행 만들기
        </button>
      </div>

      {/* 장소 추가 모달 */}
      {showModal && selectedResult && (
        <AddPlaceModal
          suggestedName={getPlaceName(selectedResult)}
          onConfirm={handleModalConfirm}
          onCancel={() => {
            setShowModal(false);
            setSelectedResult(null);
          }}
        />
      )}
    </div>
  );
}

export default StepThree;