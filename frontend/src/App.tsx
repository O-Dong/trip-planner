import MapView from './components/Map/MapView';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <MapView />
      </div>
      
      {/* 사이드바 영역 */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white shadow-lg overflow-y-auto">
        <Sidebar />
      </div>
    </div>
  );
}

export default App;