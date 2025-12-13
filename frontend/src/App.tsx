import { useState } from 'react';
import { TripProvider } from './contexts/TripContext';
import MapView from './components/Map/MapView';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'itinerary'>('itinerary');

  return (
    <TripProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        {/* 모바일 탭 버튼 */}
        <div className="md:hidden flex border-b bg-white">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            지도
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'itinerary'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            일정
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 지도 영역 */}
          <div
            className={`flex-1 relative ${
              activeTab === 'map' ? 'block' : 'hidden md:block'
            }`}
          >
            <MapView />
          </div>

          {/* 사이드바 영역 */}
          <div
            className={`w-full md:w-[400px] lg:w-[450px] bg-white shadow-lg overflow-y-auto ${
              activeTab === 'itinerary' ? 'block' : 'hidden md:block'
            }`}
          >
            <Sidebar />
          </div>
        </div>
      </div>
    </TripProvider>
  );
}

export default App;