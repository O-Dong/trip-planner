import type { Place, ItineraryStats, PlaceCategory } from "../types";

// ==================== 거리 계산 ====================

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

function kMeansClustering(places: Place[], k: number): Place[][] {
  if (places.length <= k) {
    return places.map(p => [p]);
  }

  // 초기 중심점: 가장 먼 곳들을 선택
  const centers: { lat: number; lng: number }[] = [];
  centers.push({ lat: places[0].lat, lng: places[0].lng });

  for (let i = 1; i < k; i++) {
    let maxMinDist = 0;
    let farthest = places[0];

    for (const place of places) {
      let minDist = Infinity;
      for (const center of centers) {
        const dist = calculateDistance(place.lat, place.lng, center.lat, center.lng);
        minDist = Math.min(minDist, dist);
      }
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        farthest = place;
      }
    }
    centers.push({ lat: farthest.lat, lng: farthest.lng });
  }

  // K-means 반복
  for (let iter = 0; iter < 10; iter++) {
    const clusters: Place[][] = Array.from({ length: k }, () => []);

    // 각 장소를 가장 가까운 클러스터에 할당
    for (const place of places) {
      let minDist = Infinity;
      let closestCluster = 0;

      for (let i = 0; i < k; i++) {
        const dist = calculateDistance(place.lat, place.lng, centers[i].lat, centers[i].lng);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = i;
        }
      }
      clusters[closestCluster].push(place);
    }

    // 중심점 업데이트
    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const newLat = clusters[i].reduce((sum, p) => sum + p.lat, 0) / clusters[i].length;
        const newLng = clusters[i].reduce((sum, p) => sum + p.lng, 0) / clusters[i].length;
        
        if (Math.abs(newLat - centers[i].lat) > 0.0001 || Math.abs(newLng - centers[i].lng) > 0.0001) {
          changed = true;
        }
        centers[i] = { lat: newLat, lng: newLng };
      }
    }

    if (!changed) break;
  }

  // 최종 클러스터 생성
  const finalClusters: Place[][] = Array.from({ length: k }, () => []);
  for (const place of places) {
    let minDist = Infinity;
    let closestCluster = 0;

    for (let i = 0; i < k; i++) {
      const dist = calculateDistance(place.lat, place.lng, centers[i].lat, centers[i].lng);
      if (dist < minDist) {
        minDist = dist;
        closestCluster = i;
      }
    }
    finalClusters[closestCluster].push(place);
  }

  return finalClusters.filter(cluster => cluster.length > 0);
}

// ==================== 카테고리 기반 정렬 ====================

function sortByCategory(places: Place[]): Place[] {
  const categoryOrder: Record<PlaceCategory, number> = {
    '관광': 1,
    '쇼핑': 2,
    '카페': 3,
    '식사': 4,
    '기타': 5,
  };

  return [...places].sort((a, b) => {
    const orderDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (orderDiff !== 0) return orderDiff;
    
    // 같은 카테고리면 거리 기준
    return a.lat - b.lat;
  });
}

// ==================== 2-opt 최적화 (개선됨) ====================

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

        const currentDist =
          calculateDistance(route[i].lat, route[i].lng, route[next_i].lat, route[next_i].lng) +
          calculateDistance(route[j].lat, route[j].lng, route[next_j].lat, route[next_j].lng);

        const newDist =
          calculateDistance(route[i].lat, route[i].lng, route[j].lat, route[j].lng) +
          calculateDistance(route[next_i].lat, route[next_i].lng, route[next_j].lat, route[next_j].lng);

        if (newDist < currentDist - 0.001) {
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

// ==================== Nearest Neighbor ====================

function nearestNeighborRoute(places: Place[]): Place[] {
  if (places.length <= 1) return places;

  const visited = new Set<string>();
  const result: Place[] = [];

  // 중심점에서 가장 가까운 곳을 시작점으로
  const centerLat = places.reduce((sum, p) => sum + p.lat, 0) / places.length;
  const centerLng = places.reduce((sum, p) => sum + p.lng, 0) / places.length;

  let current = places.reduce((nearest, place) => {
    const dist = calculateDistance(centerLat, centerLng, place.lat, place.lng);
    const nearestDist = calculateDistance(centerLat, centerLng, nearest.lat, nearest.lng);
    return dist < nearestDist ? place : nearest;
  });

  result.push(current);
  visited.add(current.id);

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

// ==================== 스마트 경로 최적화 (메인) ====================

export function optimizeRoute(places: Place[]): Place[] {
  if (places.length <= 1) return places;
  if (places.length <= 3) return nearestNeighborRoute(places);

  // 1. 카테고리별로 먼저 정렬 (관광 → 쇼핑 → 카페 → 식사)
  const categorySorted = sortByCategory(places);

  // 2. Nearest Neighbor로 기본 경로 생성
  const initialRoute = nearestNeighborRoute(categorySorted);

  // 3. 2-opt로 미세 조정
  const optimizedRoute = twoOptOptimization(initialRoute);

  return optimizedRoute;
}

// ==================== 스마트 일자별 분배 (개선됨) ====================

export function distributeByDays(places: Place[], numberOfDays: number): Place[][] {
  if (numberOfDays <= 0 || places.length === 0) {
    return Array.from({ length: numberOfDays }, () => []);
  }

  if (places.length <= numberOfDays) {
    // 장소가 일수보다 적으면 하루에 하나씩
    const result: Place[][] = Array.from({ length: numberOfDays }, () => []);
    places.forEach((place, i) => {
      result[i] = [place];
    });
    return result;
  }

  // 1. K-means로 지역 클러스터링 (일수만큼 또는 장소수/2 중 작은 값)
  const clusterCount = Math.min(numberOfDays, Math.ceil(places.length / 3));
  const clusters = kMeansClustering(places, clusterCount);

  // 2. 각 클러스터 내부를 최적화
  const optimizedClusters = clusters.map(cluster => optimizeRoute(cluster));

  // 3. 클러스터를 일자별로 분배
  const result: Place[][] = Array.from({ length: numberOfDays }, () => []);

  if (optimizedClusters.length <= numberOfDays) {
    // 클러스터가 일수보다 적으면 하루에 하나씩 배정
    optimizedClusters.forEach((cluster, i) => {
      result[i] = cluster;
    });
  } else {
    // 클러스터가 많으면 균등하게 분배
    let dayIndex = 0;
    for (const cluster of optimizedClusters) {
      result[dayIndex].push(...cluster);
      dayIndex = (dayIndex + 1) % numberOfDays;
    }
  }

  // 4. 빈 날짜가 있으면 가장 많은 날에서 재분배
  for (let i = 0; i < numberOfDays; i++) {
    if (result[i].length === 0) {
      // 가장 많은 날 찾기
      let maxDayIndex = 0;
      let maxCount = 0;
      for (let j = 0; j < numberOfDays; j++) {
        if (result[j].length > maxCount) {
          maxCount = result[j].length;
          maxDayIndex = j;
        }
      }

      // 절반을 빈 날로 이동
      if (result[maxDayIndex].length > 1) {
        const moveCount = Math.ceil(result[maxDayIndex].length / 2);
        result[i] = result[maxDayIndex].splice(-moveCount);
      }
    }
  }

  return result;
}

// ==================== 일정 통계 계산 ====================

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