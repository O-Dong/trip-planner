import type { NominatimResult } from "../types";

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

// 검색 실패 시 사용할 더미 데이터 (개발용)
const FALLBACK_RESULTS: NominatimResult[] = [];

export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '10',
      'accept-language': 'ja,ko,en',
    });

    const response = await fetch(`${NOMINATIM_API_URL}?${params}`, {
      headers: {
        'User-Agent': 'TravelPlannerApp/1.0', // Nominatim 요구사항
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('Nominatim API 에러:', error);
    
    // 에러 발생 시 빈 배열 반환 (프로덕션)
    // 개발 환경에서는 더미 데이터 사용 가능
    return FALLBACK_RESULTS;
  }
}

export function getPlaceName(result: NominatimResult): string {
  const address = result.address;
  
  // 우선순위에 따라 장소명 추출
  if (address) {
    if (address.tourism) return address.tourism;
    if (address.amenity) return address.amenity;
    if (address.shop) return address.shop;
    if (address.building) return address.building;
    if (address.road) return address.road;
    if (address.suburb) return address.suburb;
  }

  // display_name에서 첫 번째 부분 추출
  const parts = result.display_name.split(',');
  return parts[0].trim();
}

// 장소가 적절한 이름을 가지고 있는지 확인
export function hasProperName(result: NominatimResult): boolean {
  const address = result.address;
  if (!address) return false;

  const hasSpecificType = !!(
    address.tourism ||
    address.amenity ||
    address.shop ||
    address.building
  );

  const placeName = getPlaceName(result);
  const hasGoodName = placeName.length > 2 && placeName.length < 100;

  return hasSpecificType && hasGoodName;
}