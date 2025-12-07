import React, { useState } from 'react';
// import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import '../styles/SearchUserPage.css';

const SearchUserPage = () => {
//   const { isDarkMode } = useTheme();
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [banLoading, setBanLoading] = useState(false);

  // Моковые данные для демонстрации
  const mockUsers = {
    '123456789': {
      id: 1,
      name: 'Иван Иванов',
      chat_id: '123456789',
      phone: '+7 (999) 123-45-67',
      tg_username: '@ivanov',
      is_banned: false,
      join_date: '2024-01-15',
      total_bookings: 12,
      last_visit: '2024-03-10'
    },
    '987654321': {
      id: 2,
      name: 'Анна Петрова',
      chat_id: '987654321',
      phone: '+7 (999) 987-65-43',
      tg_username: '@annap',
      is_banned: true,
      join_date: '2023-11-20',
      total_bookings: 8,
      last_visit: '2024-02-28'
    },
    '555555555': {
      id: 3,
      name: 'Сергей Сидоров',
      chat_id: '555555555',
      phone: '+7 (999) 555-55-55',
      tg_username: '@sergeys',
      is_banned: false,
      join_date: '2024-02-01',
      total_bookings: 5,
      last_visit: '2024-03-15'
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!chatId.trim()) {
      setError('Введите chat_id пользователя');
      return;
    }

    setLoading(true);
    setError('');
    setUserData(null);

    // Имитация загрузки с сервера
    await new Promise(resolve => setTimeout(resolve, 800));

    if (mockUsers[chatId]) {
      setUserData(mockUsers[chatId]);
    } else {
      setError('Пользователь с таким chat_id не найден');
    }

    setLoading(false);
  };

  const handleBanToggle = async () => {
    if (!userData) return;

    setBanLoading(true);
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setUserData(prev => ({
      ...prev,
      is_banned: !prev.is_banned
    }));
    
    setBanLoading(false);
  };

  const handleClear = () => {
    setChatId('');
    setUserData(null);
    setError('');
  };

  return (
    <div className="search-container">
        <BackButton />
      <div className="search-header">
        <h1>Найти пользователя</h1>
        <p className="search-subtitle">
          Введите chat_id пользователя для получения информации
        </p>
      </div>

      <div className="search-content">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group">
            <label htmlFor="chatId" className="input-label">
              Chat ID пользователя
            </label>
            <div className="input-with-button">
              <input
                id="chatId"
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="input-field"
                placeholder="Например: 123456789"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleClear}
                className="clear-button"
                title="Очистить поле"
              >
                ×
              </button>
            </div>
            <p className="input-hint">
              chat_id можно найти в на листе userBooking
            </p>
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Поиск...
                </>
              ) : (
                'Найти пользователя'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-card">
            <div className="error-icon">!</div>
            <div className="error-content">
              <h3>Ошибка поиска</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {userData && (
          <div className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                {userData.name.charAt(0)}
              </div>
              <div className="user-title">
                <h2>{userData.name}</h2>
                <span className={`user-status ${userData.is_banned ? 'banned' : 'active'}`}>
                  {userData.is_banned ? '🚫 Заблокирован' : '✅ Активен'}
                </span>
              </div>
            </div>

            <div className="user-info-grid">
              <div className="info-item">
                <span className="info-label">Chat ID:</span>
                <span className="info-value code">{userData.chat_id}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Телефон:</span>
                <span className="info-value">{userData.phone}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Telegram:</span>
                <span className="info-value">{userData.tg_username}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Дата регистрации:</span>
                <span className="info-value">{userData.join_date}</span>
              </div>
              
            </div>

            <div className="user-actions">
              <button
                onClick={handleBanToggle}
                className={`ban-button ${userData.is_banned ? 'unban' : 'ban'}`}
                disabled={banLoading}
              >
                {banLoading ? (
                  <span className="spinner small"></span>
                ) : userData.is_banned ? (
                  '🔓 Разблокировать пользователя'
                ) : (
                  '🚫 Заблокировать пользователя'
                )}
              </button>
            </div>
          </div>
        )}

        {!userData && !error && (
          <div className="search-hint">
            <div className="hint-icon">💡</div>
            <div className="hint-content">
              <h3>Примеры chat_id для тестирования:</h3>
              <ul>
                <li><code>123456789</code> - активный пользователь</li>
                <li><code>987654321</code> - заблокированный пользователь</li>
                <li><code>555555555</code> - активный пользователь</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUserPage;