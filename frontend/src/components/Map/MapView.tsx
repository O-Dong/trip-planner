import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useMemo } from 'react';
import { useTripContext } from '../../contexts/TripContext';
import { getCategoryEmoji } from '../../utils/categoryHelpers';

// Leaflet 아이콘 초기화
const initializeLeafletIcons = () => {
  try {
    // 안전한 타입 체크 및 삭제
    if ('_getIconUrl' in L.Icon.Default.prototype) {
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
    }
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  } catch (e) {
    console.warn('Leaflet icon initialization warning (ignored):', e);
  }
};

initializeLeafletIcons();

const TOKYO_CENTER: [number, number] = [35.6762, 139.6503];
const DEFAULT_ZOOM = 12;

function MapView() {
  const { places, itinerary, selectedDay } = useTripContext();
  const mapRef = useRef<L.Map | null>(null);

  // 표시할 장소들 결정
  const displayPlaces = useMemo(() => {
    if (itinerary && itinerary.length > 0) {
      return itinerary[selectedDay] || [];
    }
    return places;
  }, [itinerary, selectedDay, places]);

  // 경로선 좌표 생성
  const routeCoordinates: [number, number][] = useMemo(() => {
    return displayPlaces.map((p) => [p.lat, p.lng]);
  }, [displayPlaces]);

  // 장소가 변경되면 지도 범위 조정
  useEffect(() => {
    if (mapRef.current && displayPlaces.length > 0) {
      const bounds = L.latLngBounds(displayPlaces.map((p) => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 15 
      });
    }
  }, [displayPlaces]);

  return (
    <MapContainer
      center={TOKYO_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 경로선 표시 */}
      {itinerary && routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color="#3B82F6"
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
        />
      )}

      {/* 장소 마커 표시 */}
      {displayPlaces.map((place, index) => (
        <Marker key={place.id} position={[place.lat, place.lng]}>
          <Popup>
            <div className="text-center min-w-[150px]">
              {itinerary && (
                <div className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 text-xs font-bold mb-2">
                  {index + 1}
                </div>
              )}
              <p className="font-semibold text-sm mb-1">
                {getCategoryEmoji(place.category)} {place.name}
              </p>
              <p className="text-xs text-gray-500 mb-1">{place.category}</p>
              {place.address && (
                <p className="text-xs text-gray-400 line-clamp-2">{place.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;