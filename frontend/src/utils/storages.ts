import type { Place, TripInfo } from '../types';

const STORAGE_KEY = 'travel_planner_data';

export interface StorageData {
  tripInfo: TripInfo;
  places: Place[];
  itinerary: Place[][] | null;
  selectedDay: number;
  currentStep: number;
  savedAt: string; // 저장 시간
}

// localStorage에 저장
export function saveTripData(data: Omit<StorageData, 'savedAt'>): void {
  try {
    const storageData: StorageData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save trip data:', error);
  }
}

// localStorage에서 불러오기
export function loadTripData(): StorageData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load trip data:', error);
    return null;
  }
}

// localStorage 초기화
export function clearTripData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear trip data:', error);
  }
}

// 저장된 데이터가 있는지 확인
export function hasSavedData(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}