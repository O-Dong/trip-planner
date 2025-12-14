import type { Place, ItineraryStats } from "../types";

// 두 지점 사이의 거리 계산 
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 총 경로 거리 계산
function calculateTotalDistance(places: Place[]): number {
  let total = 0;
  for (let i = 0; i < places.length - 1; i++) {
    total += calculateDistance(
      places[i].lat,
      places[i].lng,
      places[i + 1].lat,
      places[i + 1].lng
    );
  }
  return total;
}

// 2-opt 알고리즘으로 경로 최적화
function twoOptOptimization(places: Place[]): Place[] {
  if (places.length <= 3) return places;

  let route = [...places];
  let improved = true;
  const maxIterations = 100;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        const next_i = i + 1;
        const next_j = j + 1 < route.length ? j + 1 : j;

        // 현재 거리
        const currentDist =
          calculateDistance(route[i].lat, route[i].lng, route[next_i].lat, route[next_i].lng) +
          calculateDistance(route[j].lat, route[j].lng, route[next_j].lat, route[next_j].lng);

        // 교차 후 거리
        const newDist =
          calculateDistance(route[i].lat, route[i].lng, route[j].lat, route[j].lng) +
          calculateDistance(route[next_i].lat, route[next_i].lng, route[next_j].lat, route[next_j].lng);

        // 개선되면 교차
        if (newDist < currentDist - 0.001) {
          // i+1부터 j까지 역순으로 변경
          const newRoute = [
            ...route.slice(0, next_i),
            ...route.slice(next_i, j + 1).reverse(),
            ...route.slice(j + 1),
          ];
          route = newRoute;
          improved = true;
        }
      }
    }
  }

  return route;
}

// Nearest Neighbor로 초기 경로 생성
function nearestNeighborRoute(places: Place[]): Place[] {
  if (places.length <= 1) return places;

  const visited = new Set<string>();
  const result: Place[] = [];

  // 중심점 계산
  const centerLat = places.reduce((sum, p) => sum + p.lat, 0) / places.length;
  const centerLng = places.reduce((sum, p) => sum + p.lng, 0) / places.length;

  // 중심점에 가장 가까운 장소를 시작점으로
  let current = places.reduce((nearest, place) => {
    const dist = calculateDistance(centerLat, centerLng, place.lat, place.lng);
    const nearestDist = calculateDistance(centerLat, centerLng, nearest.lat, nearest.lng);
    return dist < nearestDist ? place : nearest;
  });

  result.push(current);
  visited.add(current.id);

  // 가장 가까운 장소를 순차적으로 방문
  while (visited.size < places.length) {
    let nearest: Place | null = null;
    let minDistance = Infinity;

    for (const place of places) {
      if (!visited.has(place.id)) {
        const distance = calculateDistance(current.lat, current.lng, place.lat, place.lng);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = place;
        }
      }
    }

    if (nearest) {
      result.push(nearest);
      visited.add(nearest.id);
      current = nearest;
    }
  }

  return result;
}

// 개선된 경로 최적화 (Nearest Neighbor + 2-opt)
export function optimizeRoute(places: Place[]): Place[] {
  if (places.length <= 1) return places;

  // 1. Nearest Neighbor로 초기 경로 생성
  const initialRoute = nearestNeighborRoute(places);

  // 2. 2-opt로 최적화
  const optimizedRoute = twoOptOptimization(initialRoute);

  return optimizedRoute;
}

// 일자별 분배 - 균등하게 + 지리적 근접성 고려
export function distributeByDays(places: Place[], numberOfDays: number): Place[][] {
  if (numberOfDays <= 0 || places.length === 0) {
    return Array.from({ length: numberOfDays }, () => []);
  }

  // 1. 전체 경로 최적화
  const optimizedPlaces = optimizeRoute(places);

  // 2. 일자별로 균등하게 분배
  const result: Place[][] = Array.from({ length: numberOfDays }, () => []);
  const placesPerDay = Math.ceil(optimizedPlaces.length / numberOfDays);

  for (let i = 0; i < optimizedPlaces.length; i++) {
    const dayIndex = Math.min(Math.floor(i / placesPerDay), numberOfDays - 1);
    result[dayIndex].push(optimizedPlaces[i]);
  }

  return result;
}

// 일정 통계 계산
export function calculateItineraryStats(itinerary: Place[][]): ItineraryStats {
  const perDay = itinerary.map((dayPlaces) => {
    if (dayPlaces.length === 0) {
      return { totalDistance: 0, placeCount: 0 };
    }

    const totalDistance = calculateTotalDistance(dayPlaces);
    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      placeCount: dayPlaces.length,
    };
  });

  const totalDistance = perDay.reduce((sum, day) => sum + day.totalDistance, 0);
  const totalPlaces = perDay.reduce((sum, day) => sum + day.placeCount, 0);

  return {
    perDay,
    total: {
      distance: Math.round(totalDistance * 10) / 10,
      places: totalPlaces,
    },
  };
}