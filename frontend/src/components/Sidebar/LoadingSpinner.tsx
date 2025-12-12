function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">여행 일정 생성 중...</p>
          <p className="text-sm text-gray-500 mt-1">최적의 경로를 계산하고 있습니다...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;