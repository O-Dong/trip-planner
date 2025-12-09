import { createContext, useContext, useState, ReactNode } from 'react';
import type { Place, TripInfo } from '../types';

interface TripContextType {
  // 상태
  tripInfo: TripInfo;
  places: Place[];
  itinerary: Place[][] | null;
  selectedDay: number;
  currentStep: number;

  // 액션
  updateTripInfo: (key: keyof TripInfo, value: string) => void;
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  setItinerary: (itinerary: Place[][]) => void;
  setSelectedDay: (day: number) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTrip: () => void;
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

  const updateTripInfo = (key: keyof TripInfo, value: string) => {
    setTripInfo((prev) => ({ ...prev, [key]: value }));
  };

  const addPlace = (place: Place) => {
    setPlaces((prev) => [...prev, place]);
  };

  const removePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
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
  };

  return (
    <TripContext.Provider
      value={{
        tripInfo,
        places,
        itinerary,
        selectedDay,
        currentStep,
        updateTripInfo,
        addPlace,
        removePlace,
        setItinerary,
        setSelectedDay,
        setCurrentStep,
        nextStep,
        prevStep,
        resetTrip,
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