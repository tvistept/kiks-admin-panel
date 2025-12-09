import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/Icons';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title= {isDarkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      <Icon 
        name={isDarkMode ? 'sun' : 'moon'} 
        size="lg"
        className="theme-icon"
      />
      <span className="theme-text">
        {/* {isDarkMode ? 'Светлая' : 'Тёмная'} */}
      </span>
    </button>
  );
};

export default ThemeToggle;