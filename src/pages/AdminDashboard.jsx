import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const menuItems = [
    {
      id: 1,
      title: 'Поиск посетителя',
      description: 'Поиск информации о посетителе по chat_id',
      path: '/admin/search',
      color: '#3b82f6',
      icon: '🔍'
    },
    {
      id: 2,
      title: 'Нерабочие дни',
      description: 'Создание нерабочих дней в клубе',
      path: '/admin/non-working',
      color: '#10b981',
      icon: '📅'
    },
    {
      id: 3,
      title: 'Закрытие слотов',
      description: 'Закрытие слотов для бронирования',
      path: '/admin/close-slots',
      color: '#f59e0b',
      icon: '🔒'
    },
    {
      id: 4,
      title: 'Удаление броней',
      description: 'Удаление существующих броней',
      path: '/admin/delete-bookings',
      color: '#ef4444',
      icon: '🗑️'
    },
    // {
    //   id: 5,
    //   title: '📊 Статистика',
    //   description: 'Просмотр статистики посещений и доходов',
    //   path: '/admin/stats',
    //   color: '#8b5cf6',
    //   icon: '📊'
    // },
    // {
    //   id: 6,
    //   title: '👥 Все пользователи',
    //   description: 'Просмотр списка всех пользователей',
    //   path: '/admin/users',
    //   color: '#ec4899',
    //   icon: '👥'
    // }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <h1>Админ-панель</h1>
              <p className="header-subtitle">Бильярдный клуб "KIKS"</p>
            </div>
          </div>
          
          <div className="header-right">
            <ThemeToggle />
            <button onClick={onLogout} className="logout-button">
              <svg 
                className="logout-icon" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                width="18" 
                height="18"
              >
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h2>Салют!</h2>
              <p>
                Используй меню ниже для управления различными аспектами работы бильярдного клуба.
                Все изменения сохраняются автоматически.
              </p>
            </div>
            <div className="welcome-stats">
              <div className="stat-item">
                <span className="stat-number">42</span>
                <span className="stat-label">активных броней</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">156</span>
                <span className="stat-label">пользователей</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-menu">
          <h2 className="menu-title">Меню управления</h2>
          <p className="menu-subtitle">
            Нажми на любую карточку для перехода к соответствующему разделу
          </p>
          
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div 
                key={item.id}
                className="menu-card"
                onClick={() => navigate(item.path)}
                style={{ 
                  '--card-color': item.color,
                  cursor: 'pointer'
                }}
              >
                <div className="card-icon" style={{ backgroundColor: item.color + '20' }}>
                  <span style={{ color: item.color, fontSize: '28px' }}>{item.icon}</span>
                </div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="card-arrow">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    width="20" 
                    height="20"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="recent-activity">
          <h3>📈 Быстрый доступ</h3>
          <div className="quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin/search')}
            >
              <span>🔍</span>
              Быстрый поиск
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin/non-working')}
            >
              <span>➕</span>
              Добавить выходной
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => alert('Функция в разработке')}
            >
              <span>📱</span>
              Мобильное приложение
            </button>
          </div>
        </div> */}
      </main>
    </div>
  );
};

export default AdminDashboard;