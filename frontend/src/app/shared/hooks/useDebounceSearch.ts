import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebounceSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  delay?: number;
  minLength?: number;
}

interface UseDebounceSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  clearSearch: () => void;
}

/**
 * Custom hook for debounced search functionality
 * 
 * @param searchFn - Async function that performs the search
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @param minLength - Minimum query length to trigger search (default: 1)
 * 
 * @example
 * const { query, setQuery, results, isSearching } = useDebounceSearch({
 *   searchFn: (q) => articlesApi.search({ q }),
 *   delay: 300
 * });
 */
export function useDebounceSearch<T>({
  searchFn,
  delay = 300,
  minLength = 1,
}: UseDebounceSearchOptions<T>): UseDebounceSearchReturn<T> {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Use ref to track the latest search function to avoid stale closures
  const searchFnRef = useRef(searchFn);
  
  useEffect(() => {
    searchFnRef.current = searchFn;
  }, [searchFn]);

  // Debounced search effect
  useEffect(() => {
    // Reset error when query changes
    setError(null);
    
    // If query is too short, reset results
    if (query.trim().length < minLength) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    // Set searching state immediately
    setIsSearching(true);

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchFnRef.current(query.trim());
        setResults(searchResults);
        setHasSearched(true);
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    // Cleanup function to cancel pending searches
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, delay, minLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    hasSearched,
    clearSearch,
  };
}

