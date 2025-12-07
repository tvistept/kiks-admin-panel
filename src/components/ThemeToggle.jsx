import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      {isDarkMode ? (
        // Иконка солнца для светлой темы
        <svg 
          className="theme-icon" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          width="20" 
          height="20"
        >
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-12a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm0 16a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zM5.64 7.05a1 1 0 0 0 .7.29 1 1 0 0 0 .71-.29 1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71zm12.72 12.72a1 1 0 0 0 .71.29 1 1 0 0 0 .7-.29 1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71zM23 11h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM2 11H1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm16.66-6.34a1 1 0 0 0 .7-.29l.71-.71a1 1 0 1 0-1.41-1.41l-.71.71a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.29zM5.64 19.36a1 1 0 0 0 .71.29 1 1 0 0 0 .7-.29 1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71z"/>
        </svg>
      ) : (
        // Иконка луны для темной темы
        <svg 
          className="theme-icon" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          width="20" 
          height="20"
        >
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05zm-9.5 6.69A8.14 8.14 0 0 1 7.08 5.22v.27a10.15 10.15 0 0 0 10.14 10.14 9.79 9.79 0 0 0 2.1-.22 8.11 8.11 0 0 1-7.18 4.32z"/>
        </svg>
      )}
      <span className="theme-text">
        {/* {isDarkMode ? 'Светлая' : 'Тёмная'} */}
      </span>
    </button>
  );
};

export default ThemeToggle;