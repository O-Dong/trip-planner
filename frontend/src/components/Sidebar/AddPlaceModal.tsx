import { useState, useEffect, useRef } from 'react';
import type { PlaceCategory } from '../../types';

interface AddPlaceModalProps {
  suggestedName: string;
  onConfirm: (name: string, category: PlaceCategory) => void;
  onCancel: () => void;
}

const CATEGORIES: PlaceCategory[] = ['관광', '식사', '쇼핑', '카페', '기타'];

const CATEGORY_EMOJIS: Record<PlaceCategory, string> = {
  관광: '🏛️',
  식사: '🍽️',
  쇼핑: '🛍️',
  카페: '☕',
  기타: '📍',
};

function AddPlaceModal({ suggestedName, onConfirm, onCancel }: AddPlaceModalProps) {
  const [name, setName] = useState(suggestedName);
  const [category, setCategory] = useState<PlaceCategory>('관광');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 모달이 열릴 때 입력창에 포커스
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onConfirm(trimmedName, category);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ zIndex: 9999 }}
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 animate-slideUp shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800">장소 정보 입력</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장소 이름
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소 이름을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-lg border transition-all ${
                  category === cat
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <span className="mr-1">{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPlaceModal;