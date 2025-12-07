interface StepOneProps {
  tripName: string;
  onUpdate: (name: string) => void;
  onNext: () => void;
}

function StepOne({ tripName, onUpdate, onNext }: StepOneProps) {
  const handleNext = () => {
    if (tripName.trim()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
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
          value={tripName}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="여행 이름 입력"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!tripName.trim()}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
    </div>
  );
}

export default StepOne;