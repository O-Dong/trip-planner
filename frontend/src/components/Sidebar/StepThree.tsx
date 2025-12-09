import { useState } from 'react';
import type { Place, PlaceCategory, TripInfo } from '../../types';
import { getPlaceName, searchPlaces, type NominatimResult } from '../../utils/nominatim';
import AddPlaceModal from './AddPlaceModal';


interface StepThreeProps {
  tripInfo: TripInfo;
  places: Place[];
  onPrev: () => void;
  onAddPlace: (place: Place) => void;
  onRemovePlace: (id: string) => void;
}

function StepThree({ tripInfo, places, onPrev, onAddPlace, onRemovePlace }: StepThreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // 검색 실행 여부 추가
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<NominatimResult | null>(null);

  const calculateDuration = () => {
    const start = new Date(tripInfo.startDate);
    const end = new Date(tripInfo.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = diffDays - 1;
    return { nights, days: diffDays };
  };

  const duration = calculateDuration();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false); // 검색 시작 시 초기화
    const results = await searchPlaces(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleSelectPlace = (result: NominatimResult) => {
    const placeName = getPlaceName(result);
    
    // 이름이 명확한 장소인지 확인 (간단한 휴리스틱)
    const hasProperName = result.address?.tourism || 
                          result.address?.amenity || 
                          result.address?.shop;
    
    if (hasProperName && placeName.length > 2) {
      // 바로 추가
      const newPlace: Place = {
        id: `place-${Date.now()}`,
        name: placeName,
        category: '관광',
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
      };
      onAddPlace(newPlace);
      setSearchResults([]);
      setSearchQuery('');
      setHasSearched(false); // 초기화
    } else {
      // 모달 띄우기
      setSelectedResult(result);
      setShowModal(true);
    }
  };

  const handleModalConfirm = (name: string, category: PlaceCategory) => {
    if (selectedResult) {
      const newPlace: Place = {
        id: `place-${Date.now()}`,
        name,
        category,
        lat: parseFloat(selectedResult.lat),
        lng: parseFloat(selectedResult.lon),
        address: selectedResult.display_name,
      };
      onAddPlace(newPlace);
      setShowModal(false);
      setSelectedResult(null);
      setSearchResults([]);
      setSearchQuery('');
      setHasSearched(false);
    }
  };

  const getCategoryEmoji = (category: PlaceCategory) => {
    const emojis = {
      '관광': '🏛️',
      '식사': '🍽️',
      '쇼핑': '🛍️',
      '카페': '☕',
      '기타': '📍',
    };
    return emojis[category];
  };

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
          장소를 추가해주세요
        </h3>
        <p className="text-sm text-gray-500">
          검색창에 장소명이나 주소를 입력하세요
        </p>
      </div>

      {/* 검색 영역 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

        {/* 검색 결과 없음 메시지 */}
        {hasSearched && searchResults.length === 0 && (
          <div className="border border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <p className="text-gray-700 font-medium mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-500">
              다른 키워드로 다시 검색해보세요!
            </p>
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
          <h4 className="font-semibold text-gray-700">
            추가된 장소 ({places.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {getCategoryEmoji(place.category)} {place.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {place.address}
                  </p>
                </div>
                <button
                  onClick={() => onRemovePlace(place.id)}
                  className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
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
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
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