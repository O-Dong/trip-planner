export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    tourism?: string;
    amenity?: string;
    shop?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    building?: string;
    house_number?: string;
    [key: string]: string | undefined;
  };
  type?: string;
  importance?: number;
}

export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        'accept-language': 'ja,ko,en',
      })
    );

    if (!response.ok) {
      throw new Error('검색 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Nominatim API 에러:', error);
    return [];
  }
}

export function getPlaceName(result: NominatimResult): string {
  // 주소에서 장소명 추출 시도
  const address = result.address;
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