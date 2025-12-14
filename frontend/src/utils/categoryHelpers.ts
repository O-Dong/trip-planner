import type { PlaceCategory } from '../types';

export const CATEGORY_EMOJIS: Record<PlaceCategory, string> = {
  관광: '🏛️',
  식사: '🍽️',
  쇼핑: '🛍️',
  카페: '☕',
  기타: '📍',
};

export const CATEGORIES: PlaceCategory[] = ['관광', '식사', '쇼핑', '카페', '기타'];

export function getCategoryEmoji(category: PlaceCategory): string {
  return CATEGORY_EMOJIS[category];
}