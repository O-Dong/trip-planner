import { useTripContext } from '../../contexts/TripContext';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import ItineraryView from './ItineraryView';
import LoadingSpinner from './LoadingSpinner';

function Sidebar() {
  const { currentStep, isGenerating } = useTripContext();

  return (
    <>
      <div className="p-6 h-full flex flex-col">
        {/* 헤더 */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">여행 플래너</h1>
          <p className="text-sm text-gray-500 mt-1">나만의 여행 계획을 만들어보세요</p>
        </div>

        {/* Step Indicator - Step 4에서는 숨김 */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-blue-500 text-white scale-110'
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
        )}

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 && <StepOne />}
          {currentStep === 2 && <StepTwo />}
          {currentStep === 3 && <StepThree />}
          {currentStep === 4 && <ItineraryView />}
        </div>
      </div>

      {/* 로딩 스피너 */}
      {isGenerating && <LoadingSpinner />}
    </>
  );
}

export default Sidebar;