import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import '../styles/PlaceholderPage.css';

const PlaceholderPage = ({ title, description, icon = '🚧' }) => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-container">
      <BackButton />
      
      <div className="placeholder-content">
        <div className="placeholder-icon">{icon}</div>
        <h1>{title}</h1>
        <p className="placeholder-description">{description}</p>
        
        <div className="placeholder-actions">
          <button 
            onClick={() => navigate('/admin')}
            className="placeholder-button primary"
          >
            Вернуться в панель
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="placeholder-button secondary"
          >
            Обновить страницу
          </button>
        </div>
        
        <div className="placeholder-info">
          <p>⏳ Эта функция находится в разработке</p>
          <p>Скоро здесь появится полноценный интерфейс!</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;