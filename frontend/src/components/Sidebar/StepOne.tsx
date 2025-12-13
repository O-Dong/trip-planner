import { useEffect, useState } from 'react';
import { useTripContext } from '../../contexts/TripContext';
import { hasSavedData, loadTripData } from '../../utils/storages';

function StepOne() {
  const { tripInfo, updateTripInfo, nextStep, setCurrentStep } = useTripContext();
  const [showResume, setShowResume] = useState(false);
  const [savedTripName, setSavedTripName] = useState('');

  useEffect(() => {
    // 저장된 데이터가 있고, 현재 Step 1이면 이어하기 버튼 표시
    if (hasSavedData()) {
      const data = loadTripData();
      if (data && data.currentStep > 1 && data.tripInfo.name) {
        setShowResume(true);
        setSavedTripName(data.tripInfo.name);
      }
    }
  }, []);

  const handleNext = () => {
    if (tripInfo.name.trim()) {
      nextStep();
    }
  };

  const handleResume = () => {
    const data = loadTripData();
    if (data) {
      setCurrentStep(data.currentStep);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tripInfo.name.trim()) {
      handleNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* 이어하기 알림 */}
      {showResume && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium text-sm mb-2">
            저장된 여행이 있습니다!
          </p>
          <p className="text-blue-600 text-xs mb-3">
            "{savedTripName}" 여행을 이어서 작성하시겠어요?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="flex-1 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              이어서 하기
            </button>
            <button
              onClick={() => setShowResume(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              새로 만들기
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          여행의 이름을 정해주세요
        </h2>
        <p className="text-sm text-gray-500">
          예: 도쿄 여행, 오사카 맛집 투어, 교토 힐링 여행
        </p>
      </div>

      <div>
        <input
          type="text"
          value={tripInfo.name}
          onChange={(e) => updateTripInfo('name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="여행 이름 입력"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!tripInfo.name.trim()}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
    </div>
  );
}

export default StepOne;