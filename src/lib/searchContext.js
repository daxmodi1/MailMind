'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }

    setIsSearching(true);
    setIsSearchActive(true);

    try {
      // Search using Gmail API with query parameter
      const response = await fetch(`/api/gmail?type=search&q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        const emails = Array.isArray(data) ? data : (data.emails || []);
        setSearchResults(emails);
      } else {
        // Search failed
        setSearchResults([]);
      }
    } catch (error) {
      // Search error occurred
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        isSearchActive,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
