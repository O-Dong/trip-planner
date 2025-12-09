import { useState, useEffect, useCallback } from 'react';
import { searchPlaces } from '../utils/nominatim';
import type { NominatimResult } from '../types';

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: NominatimResult[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  performSearch: () => Promise<void>;
  clearResults: () => void;
}

export function useSearch(debounceMs: number = 500): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setError(null);

    try {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setHasSearched(true);

      if (results.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드로 시도해보세요.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // 결과 초기화
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);
    setError(null);
  }, []);

  // 디바운싱 (자동 검색은 비활성화, 수동 검색만 지원)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
    }
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    error,
    performSearch,
    clearResults,
  };
}