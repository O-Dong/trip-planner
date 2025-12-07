function Sidebar() {
  return (
    <div className="p-6 h-full">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">여행 플래너</h1>
          <p className="text-sm text-gray-500 mt-1">나만의 여행 계획을 만들어보세요</p>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              여행 계획 입력 폼이 여기에 들어갈 예정입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;