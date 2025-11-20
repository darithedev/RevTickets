'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDebounceSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  delay?: number;
  minLength?: number;
}

interface UseDebounceSearchResult<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isSearching: boolean;
  error: string | null;
  clearSearch: () => void;
}

export function useDebounceSearch<T>({
  searchFn,
  delay = 300,
  minLength = 1,
}: UseDebounceSearchOptions<T>): UseDebounceSearchResult<T> {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsSearching(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // If query is too short, clear results
    if (query.length < minLength) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    // Set up debounced search
    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, searchFn, delay, minLength]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  };
}
