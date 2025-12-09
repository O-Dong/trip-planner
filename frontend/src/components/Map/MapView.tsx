/* eslint-disable @typescript-eslint/no-explicit-any */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Place } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  places: Place[];
}

function MapView({ places }: MapViewProps) {
  // 일본 도쿄 중심 좌표
  const center: [number, number] = [35.6762, 139.6503];
  const zoom = 12;
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // 장소가 추가되면 지도 범위 조정
    if (mapRef.current && places.length > 0) {
      const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '관광': '#3B82F6',
      '식사': '#EF4444',
      '쇼핑': '#8B5CF6',
      '카페': '#F59E0B',
      '기타': '#6B7280',
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      '관광': '🏛️',
      '식사': '🍽️',
      '쇼핑': '🛍️',
      '카페': '☕',
      '기타': '📍',
    };
    return emojis[category] || '📍';
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 추가된 장소들 마커 표시 */}
      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]}>
          <Popup>
            <div className="text-center">
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