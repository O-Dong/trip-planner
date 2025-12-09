import { useState } from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import type { Place, TripInfo } from '../../types';

interface SidebarProps {
  onPlacesChange?: (places: Place[]) => void;
}

function Sidebar({ onPlacesChange }: SidebarProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tripInfo, setTripInfo] = useState<TripInfo>({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [places, setPlaces] = useState<Place[]>([]);

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const updateTripInfo = (key: keyof TripInfo, value: string) => {
    setTripInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleAddPlace = (place: Place) => {
    const newPlaces = [...places, place];
    setPlaces(newPlaces);
    if (onPlacesChange) {
      onPlacesChange(newPlaces);
    }
  };

  const handleRemovePlace = (id: string) => {
    const newPlaces = places.filter(p => p.id !== id);
    setPlaces(newPlaces);
    if (onPlacesChange) {
      onPlacesChange(newPlaces);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* 헤더 */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">여행 플래너</h1>
        <p className="text-sm text-gray-500 mt-1">나만의 여행 계획을 만들어보세요</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step === currentStep
                  ? 'bg-blue-500 text-white'
                  : step < currentStep
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-1 mx-2 transition-colors ${
                  step < currentStep ? 'bg-blue-200' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 1 && (
          <StepOne
            tripName={tripInfo.name}
            onUpdate={(name) => updateTripInfo('name', name)}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            startDate={tripInfo.startDate}
            endDate={tripInfo.endDate}
            onUpdate={updateTripInfo}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}
        {currentStep === 3 && (
          <StepThree
            tripInfo={tripInfo}
            places={places}
            onPrev={handlePrevStep}
            onAddPlace={handleAddPlace}
            onRemovePlace={handleRemovePlace}
          />
        )}
      </div>
    </div>
  );
}

export default Sidebar;