// 여행 정보 타입
export interface TripInfo {
  name: string;
  startDate: string;
  endDate: string;
}

// 장소 카테고리
export type PlaceCategory = '관광' | '식사' | '쇼핑' | '카페' | '기타';

// 장소 정보 타입
export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address?: string;
}

// Nominatim API 응답 타입
export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    tourism?: string;
    amenity?: string;
    shop?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    building?: string;
    house_number?: string;
    [key: string]: string | undefined;
  };
  type?: string;
  importance?: number;
}

// 여행 통계 타입
export interface ItineraryStats {
  perDay: {
    totalDistance: number;
    placeCount: number;
  }[];
  total: {
    distance: number;
    places: number;
  };
}

// 에러 타입
export interface AppError {
  message: string;
  type: 'warning' | 'error' | 'info';
}