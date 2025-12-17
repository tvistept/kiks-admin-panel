import React, { useState,  useEffect} from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import { Icon } from '../components/Icons';
import BackButton from '../components/BackButton';
import '../styles/SearchUserPage.css';
const API_BASE_URL = 'https://kiks-app.ru:5000/api';

const SearchUserPage = () => {
//   const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [banLoading, setBanLoading] = useState(false);

  // Флаг для возврата
  const [hasReturnPath, setHasReturnPath] = useState(false);



  useEffect(() => {
    if (location.state) {
      const { chatId: navChatId, returnToBookings, bookingsSearchState } = location.state;
      
      if (navChatId) {
        setChatId(navChatId);
        
        // Автоматически запускаем поиск
        if (navChatId.trim()) {
          handleSearchFromNavigation(navChatId);
        }
      }
      
      // Устанавливаем флаг для кнопки возврата
      if (returnToBookings && bookingsSearchState) {
        setHasReturnPath(true);
      }
    }
  }, [location.state]);

  // Функция для возврата к результатам поиска броней
  const handleReturnToBookings = () => {
    if (location.state && location.state.bookingsSearchState) {
      navigate('/admin/delete-bookings', {
        state: location.state.bookingsSearchState
      });
    } else {
      navigate('/admin/delete-bookings');
    }
  };

  // Новая функция для автоматического поиска при переходе
  const handleSearchFromNavigation = async (chatIdFromNav) => {
    if (!chatIdFromNav.trim()) return;

    setLoading(true);
    setError('');
    setUserData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/get-user?chat_id=${chatIdFromNav}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователя');
      }
      const data = await response.json();
      const user = Array.isArray(data) ? data[0] : data;
      setUserData(user);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке пользователя:', err);
    } finally {
      setLoading(false);
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

    try {
      const response = await fetch(`${API_BASE_URL}/get-user?chat_id=${chatId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователя');
      }
      const data = await response.json();
      // const data = getMockData();
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
    let newBlockedStatus = userData.blocked_status ? 0 : 1;
    try {
      // const response = await fetch(`${API_BASE_URL}/update-blocked-status?chat_id=${userData.chat_id}&blocked_status=${newBlockedStatus}`);
      const response = await fetch(`${API_BASE_URL}/update-blocked-status`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ 
          chat_id: userData.chat_id,
          blocked_status: newBlockedStatus 
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка обновления статуса пользователя');
      }
      // Имитация запроса на сервер
      setUserData(prev => ({
        ...prev,
        blocked_status: newBlockedStatus
      }));

    } catch (err) {
      setError(err.message);
      console.error('Ошибка обновления статуса пользователя:', err);
    } finally {
      setBanLoading(false);
    }
  };

  const handleClear = () => {
    setChatId('');
    setUserData(null);
    setError('');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // const getMockData = () => [
  //  {
  //   "id": 4178,
  //   "chat_id": "93753787",
  //   "firstName": "липкий плот",
  //   "phone": "89995280695",
  //   "user_name": "tvistept",
  //   "blocked_status": null,
  //   "createdAt": "2025-12-04T17:12:24.509Z",
  //   "updatedAt": "2025-12-04T17:12:49.912Z"
  //   }
  // ];

  return (
    <div className="search-container">
      {/* <BackButton /> */}
      <div className="search-header-actions">
        {hasReturnPath ? (
           <button 
            onClick={handleReturnToBookings}
            className="back-button"
            aria-label="Вернуться к результатам поиска броней"
          >
            <Icon name="arrowLeft" size="lg" className="back-icon" />
            Вернуться к броням
          </button>
        ) : (
          <BackButton />
        )}
      </div>
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
                type="number"
                value={chatId}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Оставляем только цифры
                  const digits = inputValue.replace(/[^\d-]|^-(?=.*-)/g, '');
                  setChatId(digits)
                }}
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
                <span className="info-value">{formatDate(userData.createdAt)}</span>
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