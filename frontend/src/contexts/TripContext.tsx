import { createContext, useContext, useState, ReactNode } from 'react';
import type { Place, TripInfo } from '../types';

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

  const updateTripInfo = (key: keyof TripInfo, value: string) => {
    setTripInfo((prev) => ({ ...prev, [key]: value }));
  };

  const addPlace = (place: Place) => {
    setPlaces((prev) => [...prev, place]);
  };

  const removePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlace = (id: string, updates: Partial<Place>) => {
    setPlaces((prev) =>
      prev.map((place) => (place.id === id ? { ...place, ...updates } : place))
    );
  };

  // 같은 날 내에서 장소 순서 변경
  const movePlaceInDay = (dayIndex: number, fromIndex: number, toIndex: number) => {
    if (!itinerary) return;
    
    const newItinerary = [...itinerary];
    const dayPlaces = [...newItinerary[dayIndex]];
    const [movedPlace] = dayPlaces.splice(fromIndex, 1);
    dayPlaces.splice(toIndex, 0, movedPlace);
    newItinerary[dayIndex] = dayPlaces;
    setItinerary(newItinerary);
  };

  // 다른 날로 장소 이동
  const movePlaceBetweenDays = (fromDay: number, toDay: number, placeIndex: number) => {
    if (!itinerary) return;
    
    const newItinerary = [...itinerary];
    const [movedPlace] = newItinerary[fromDay].splice(placeIndex, 1);
    newItinerary[toDay].push(movedPlace);
    setItinerary(newItinerary);
  };

  // 일정에서 장소 삭제
  const removePlaceFromItinerary = (dayIndex: number, placeIndex: number) => {
    if (!itinerary) return;
    
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].splice(placeIndex, 1);
    setItinerary(newItinerary);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetTrip = () => {
    setTripInfo(INITIAL_TRIP_INFO);
    setPlaces([]);
    setItinerary(null);
    setSelectedDay(0);
    setCurrentStep(1);
    setIsGenerating(false);
  };

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