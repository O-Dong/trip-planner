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