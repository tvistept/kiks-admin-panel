import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [bookingsSearchState, setBookingsSearchState] = useState({
    searchType: '', // 'date' или 'chatId'
    searchParams: null, // параметры поиска
    searchResults: [], // результаты
    timestamp: null // время поиска
  });

  const saveBookingsSearch = (searchType, searchParams, searchResults) => {
    setBookingsSearchState({
      searchType,
      searchParams,
      searchResults,
      timestamp: Date.now()
    });
  };

  const clearBookingsSearch = () => {
    setBookingsSearchState({
      searchType: '',
      searchParams: null,
      searchResults: [],
      timestamp: null
    });
  };

  return (
    <SearchContext.Provider 
      value={{ 
        bookingsSearchState, 
        saveBookingsSearch,
        clearBookingsSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};