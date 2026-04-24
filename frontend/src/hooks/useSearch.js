// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import { useState, useEffect, useMemo } from 'react';

// A custom hook that manages search text with 300ms debouncing and filter state.
// Every list screen imports this and passes queryParams to its API call.
//
// initialFilters: object with initial filter values (e.g. { category: '', supplier: '' })
const useSearch = (initialFilters = {}) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search text by 300ms so we don't fire an API call on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Build the query params object that gets passed to the API call.
  // Memoised so that consumers' useCallback/useEffect deps stay stable
  // across renders where the actual values haven't changed.
  const queryParams = useMemo(() => ({
    search: debouncedSearch,
    ...filters,
  }), [debouncedSearch, filters]);

  const resetSearch = () => {
    setSearchText('');
    setFilters(initialFilters);
  };

  return {
    searchText,
    setSearchText,
    filters,
    setFilters,
    queryParams,
    resetSearch,
  };
};

export default useSearch;
