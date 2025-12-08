import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import '../styles/BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/admin')}
      className="back-button"
      aria-label="Вернуться в панель управления"
    >
      <Icon name="arrowLeft" size="lg" className="back-icon" />
      Назад
    </button>
  );
};

export default BackButton;