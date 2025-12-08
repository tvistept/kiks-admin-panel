import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/admin')}
      className="back-button"
      aria-label="Вернуться в панель управления"
    >
      <svg 
        className="back-icon" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        width="20" 
        height="20"
      >
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
      Назад
    </button>
  );
};

export default BackButton;