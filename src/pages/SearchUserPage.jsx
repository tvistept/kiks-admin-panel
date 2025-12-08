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

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!chatId.trim()) {
      setError('Введите chat_id пользователя');
      return;
    }

    setLoading(true);
    setError('');
    setUserData(null);

    try {
      const response = await fetch(`https://kiks-app.ru:5000/api/get-user?chat_id=${chatId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователя');
      }
      const data = await response.json();
      const user = Array.isArray(data) ? data[0] : data;
      setUserData(user); // Сохраняем данные в состоянии
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке пользователя:', err);
    } finally {
      setLoading(false);
    }

  };

  const handleBanToggle = async () => {
    if (!userData) return;

    setBanLoading(true);
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setUserData(prev => ({
      ...prev,
      blocked_status: !prev.blocked_status
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
          Введи chat_id пользователя для получения информации
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
              <p>{error}. Обратись к разработчику.</p>
            </div>
          </div>
        )}

        {userData && (
          <div className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                {userData.firstName.charAt(0)}
              </div>
              <div className="user-title">
                <h2>{userData.firstName}</h2>
                <span className={`user-status ${userData.blocked_status ? 'banned' : 'active'}`}>
                  {userData.blocked_status ? 'Заблокирован' : 'Активен'}
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
                <span className="info-value">{userData.user_name}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Дата регистрации:</span>
                <span className="info-value">{userData.createdAt}</span>
              </div>
              
            </div>

            <div className="user-actions">
              <button
                onClick={handleBanToggle}
                className={`ban-button ${userData.blocked_status ? 'unban' : 'ban'}`}
                disabled={banLoading}
              >
                {banLoading ? (
                  <span className="spinner small"></span>
                ) : userData.blocked_status ? (
                  'Разблокировать пользователя'
                ) : (
                  'Заблокировать пользователя'
                )}
              </button>
            </div>
          </div>
        )}

        {/* {!userData && !error && (
          <div className="search-hint">
            <div className="hint-icon">💡</div>
            <div className="hint-content">
              <h3>Примеры chat_id для тестирования:</h3>
              <ul>
                <li><code>93753787</code> - активный пользователь</li>
              </ul>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default SearchUserPage;