import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Place, TripInfo } from '../types';
import { clearTripData, loadTripData, saveTripData } from '../utils/storages';

/* eslint-disable react-refresh/only-export-components */

interface TripContextType {
  // 상태
  tripInfo: TripInfo;
  places: Place[];
  itinerary: Place[][] | null;
  selectedDay: number;
  currentStep: number;
  isGenerating: boolean;

  // 액션
  updateTripInfo: (key: keyof TripInfo, value: string) => void;
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  setItinerary: (itinerary: Place[][]) => void;
  setSelectedDay: (day: number) => void;
  setCurrentStep: (step: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTrip: () => void;
  
  // 일정 편집 액션
  movePlaceInDay: (dayIndex: number, fromIndex: number, toIndex: number) => void;
  movePlaceBetweenDays: (fromDay: number, toDay: number, placeIndex: number) => void;
  removePlaceFromItinerary: (dayIndex: number, placeIndex: number) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const INITIAL_TRIP_INFO: TripInfo = {
  name: '',
  startDate: '',
  endDate: '',
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [tripInfo, setTripInfo] = useState<TripInfo>(INITIAL_TRIP_INFO);
  const [places, setPlaces] = useState<Place[]>([]);
  const [itinerary, setItinerary] = useState<Place[][] | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 앱 시작 시 localStorage에서 복구
  useEffect(() => {
    const savedData = loadTripData();
    if (savedData) {
      setTripInfo(savedData.tripInfo);
      setPlaces(savedData.places);
      setItinerary(savedData.itinerary);
      setSelectedDay(savedData.selectedDay);
      setCurrentStep(savedData.currentStep);
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의도적으로 빈 배열: 마운트 시에만 실행

  // 상태 변경 시 자동 저장 (초기화 후에만)
  useEffect(() => {
    if (!isInitialized) return;

    // Step 1에서 아무것도 입력 안 했으면 저장 안 함
    if (currentStep === 1 && !tripInfo.name) return;

    saveTripData({
      tripInfo,
      places,
      itinerary,
      selectedDay,
      currentStep,
    });
  }, [tripInfo, places, itinerary, selectedDay, currentStep, isInitialized]);

  // useCallback으로 함수 메모이제이션
  const updateTripInfo = useCallback((key: keyof TripInfo, value: string) => {
    setTripInfo((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addPlace = useCallback((place: Place) => {
    setPlaces((prev) => [...prev, place]);
  }, []);

  const removePlace = useCallback((id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlace = useCallback((id: string, updates: Partial<Place>) => {
    setPlaces((prev) =>
      prev.map((place) => (place.id === id ? { ...place, ...updates } : place))
    );
  }, []);

  // 같은 날 내에서 장소 순서 변경
  const movePlaceInDay = useCallback((dayIndex: number, fromIndex: number, toIndex: number) => {
    setItinerary((prevItinerary) => {
      if (!prevItinerary) return prevItinerary;
      
      const newItinerary = [...prevItinerary];
      const dayPlaces = [...newItinerary[dayIndex]];
      const [movedPlace] = dayPlaces.splice(fromIndex, 1);
      dayPlaces.splice(toIndex, 0, movedPlace);
      newItinerary[dayIndex] = dayPlaces;
      return newItinerary;
    });
  }, []);

  // 다른 날로 장소 이동
  const movePlaceBetweenDays = useCallback((fromDay: number, toDay: number, placeIndex: number) => {
    setItinerary((prevItinerary) => {
      if (!prevItinerary) return prevItinerary;
      
      const newItinerary = [...prevItinerary];
      const [movedPlace] = newItinerary[fromDay].splice(placeIndex, 1);
      newItinerary[toDay] = [...newItinerary[toDay], movedPlace];
      return newItinerary;
    });
  }, []);

  // 일정에서 장소 삭제
  const removePlaceFromItinerary = useCallback((dayIndex: number, placeIndex: number) => {
    setItinerary((prevItinerary) => {
      if (!prevItinerary) return prevItinerary;
      
      const newItinerary = [...prevItinerary];
      newItinerary[dayIndex] = newItinerary[dayIndex].filter((_, idx) => idx !== placeIndex);
      return newItinerary;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetTrip = useCallback(() => {
    setTripInfo(INITIAL_TRIP_INFO);
    setPlaces([]);
    setItinerary(null);
    setSelectedDay(0);
    setCurrentStep(1);
    setIsGenerating(false);
    clearTripData(); // localStorage도 초기화
  }, []);

  return (
    <TripContext.Provider
      value={{
        tripInfo,
        places,
        itinerary,
        selectedDay,
        currentStep,
        isGenerating,
        updateTripInfo,
        addPlace,
        removePlace,
        updatePlace,
        setItinerary,
        setSelectedDay,
        setCurrentStep,
        setIsGenerating,
        nextStep,
        prevStep,
        resetTrip,
        movePlaceInDay,
        movePlaceBetweenDays,
        removePlaceFromItinerary,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider');
  }
  return context;
}