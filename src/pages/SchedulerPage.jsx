// SchedulerPage.jsx (дополненный)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import BackButton from '../components/BackButton';
import '../styles/SchedulerPage.css';

const API_BASE_URL = 'https://kiks.space:5000/api';
const START = 12;
const END = 26; // 02:00 следующего дня

// Конфигурация столов для каждого клуба
const TABLES_CONFIG = {
  kiks1: [3, 4, 5, 6],
  kiks2: [3, 4, 6, 7, 8],
  kiks3: [2, 3, 4],
};

// Вспомогательная функция для форматирования даты в ДД.ММ.ГГГГ
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Генерация массива дат
const generateDateOptions = (clubId) => {
  const daysAhead = clubId === 'kiks2' ? 20 : 10;
  const options = [];
  const today = new Date();

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    options.push(formatDate(date));
  }

  return options;
};

function formatHour(h) {
  const h1 = h % 24;
  const h2 = (h + 1) % 24;

  const pad = (v) => String(v).padStart(2, "0");

  return `${pad(h1)}:00 - ${pad(h2)}:00`;
}

function getHourIndex(time) {
  const h = parseInt(time.split(":")[0]);
  return h;
}

const SchedulerPage = () => {
  const { saveBookingsSearch, bookingsSearchState } = useSearch();
  const navigate = useNavigate();

  // Состояния для поиска по клубу и дате
  const [searchClub, setSearchClub] = useState('kiks1');
  const [searchDate, setSearchDate] = useState('');
  
  // Состояния для поиска по chat_id (оставляем для будущего использования)
  const [searchByChatId, setSearchByChatId] = useState(false);
  const [searchChatId, setSearchChatId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для броней с АПИ
  const [apiBookings, setApiBookings] = useState([]);
  
  // Состояние для диалога подтверждения удаления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Состояние для хранения доступных дат
  const [dateOptions, setDateOptions] = useState([]);

  // Состояния для панели информации о пользователе
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Получаем актуальный список столов для выбранного клуба
  const tables = TABLES_CONFIG[searchClub] || TABLES_CONFIG.kiks1;

  // Эффект для обновления списка дат при изменении клуба
  useEffect(() => {
    const options = generateDateOptions(searchClub);
    setDateOptions(options);
    // Устанавливаем первую дату из списка как значение по умолчанию
    if (options.length > 0) {
      setSearchDate(options[0]);
    }
  }, [searchClub]);

  // Функция загрузки броней
  const fetchBookings = async (club, date) => {
    if (!club || !date) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/get-bookings-by-date?club_id=${club}&booking_date=${date}`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки броней');
      }
      
      const results = await response.json();
      setApiBookings(results);
      
      if (results.length === 0) {
        const clubText = club === 'kiks1' ? 'на Марата' : 'на Каменноостровском';
        setError(`Брони на ${date} в клубе ${clubText} не найдены`);
      } else {
        setSuccess(`Найдено броней: ${results.length}`);
        
        // Сохраняем состояние поиска
        saveBookingsSearch(
          'date',
          {
            searchByChatId: false,
            searchClub: club,
            searchDate: date,
            searchChatId: ''
          },
          results
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке броней:', err);
      setApiBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Эффект для загрузки при изменении клуба или даты
  useEffect(() => {
    if (searchClub && searchDate) {
      fetchBookings(searchClub, searchDate);
    }
  }, [searchClub, searchDate]);

  // Функция загрузки данных пользователя по chat_id
  const handleUserClick = async (chatId) => {
    if (!chatId) return;
    
    setLoadingUser(true);
    setUserError('');
    setSelectedUser(null);
    setShowUserDetails(true); // Показываем панель сразу, даже до загрузки
    
    try {
      const response = await fetch(`${API_BASE_URL}/get-user?chat_id=${chatId}`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных пользователя');
      }
      
      const userData = await response.json();
      setSelectedUser(userData);
    } catch (err) {
      setUserError(err.message);
      console.error('Ошибка при загрузке пользователя:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Функция закрытия панели
  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
    setUserError('');
  };

  // Группировка броней по столам для отображения
  const bookingsByTable = {};
  tables.forEach((t) => {
    bookingsByTable[t] = apiBookings.filter((b) => b.table === t);
  });

  const hours = [];
  for (let h = START; h < END; h++) hours.push(h);

  // Функция для получения названия клуба
  const getClubName = (clubId) => {
    let clubName = '';
    switch (clubId) {
      case 'kiks1': clubName = 'на Марата'; break;
      case 'kiks2': clubName = 'на Каменноостровском'; break;
      case 'kiks3': clubName = 'в Севкабелe'; break;
      default: clubName = '';
    }
    return clubName;
  };

  // Форматирование даты регистрации (если приходит в ISO формате)
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="delete-bookings-container">
      <BackButton />

      <div className="delete-bookings-header">
        <h1>Таблица броней</h1>
        <p className="page-subtitle">
          {searchClub && searchDate && (
            <>Клуб {getClubName(searchClub)} • {searchDate}</>
          )}
        </p>
      </div>

      <div className="form-section">
        <div className="search-fields">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="searchClub" className="form-label">
                Клуб
              </label>
              <select
                id="searchClub"
                value={searchClub}
                onChange={(e) => setSearchClub(e.target.value)}
                className="club-select"
                disabled={loading}
              >
                <option value="kiks1">Марата (столы: 3, 4, 5, 6)</option>
                <option value="kiks2">Каменноостровский (столы: 3, 4, 6, 7, 8)</option>
                <option value="kiks3">Севкабель (столы: 2, 3, 4)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="searchDate" className="form-label">
                Дата
              </label>
              <select
                id="searchDate"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setError('');
                }}
                className="date-select"
                disabled={loading}
                required
              >
                {dateOptions.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {/* Индикатор загрузки */}
            {loading && (
              <div className="loading-indicator">
                <span className="spinner-small"></span>
                Загрузка...
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
            <button 
              onClick={(e) => fetchBookings(searchClub, searchDate)}
              className="search-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Обновление...
                </>
              ) : (
                'Обновить данные'
              )}
            </button>
          </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && !loading && (
          <div className="success-message">
            {success}
          </div>
        )}
      </div>

      <div className="scheduler-wrapper">
        <div className="scheduler-scroll">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Загрузка данных...</p>
            </div>
          ) : (
            <table className="scheduler-table">
              <thead>
                <tr>
                  <th className="table-col">Столы</th>
                  {hours.map((h) => (
                    <th key={h}>{formatHour(h)}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tables.map((table) => {
                  const bookings = bookingsByTable[table] || [];
                  const used = {};

                  return (
                    <tr key={table}>
                      <td className="table-number-cell">Стол {table}</td>

                      {hours.map((h) => {
                        if (used[h]) return null;

                        const booking = bookings.find(
                          (b) => getHourIndex(b.time) === h,
                        );

                        if (booking) {
                          const span = booking.hours;

                          for (let i = 0; i < span; i++) {
                            used[h + i] = true;
                          }

                          return (
                            <td 
                              key={h} 
                              colSpan={span} 
                              className="booking-cell clickable" 
                              title={`${booking.user_name} (ID: ${booking.booking_id}, ${booking.hours}ч)`}
                              onClick={() => handleUserClick(booking.chat_id)}
                            >
                              {booking.user_name}
                            </td>
                          );
                        }

                        return <td key={h} className="free-cell" />;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Панель детальной информации о пользователе */}
      {showUserDetails && (
        <div className="user-details-panel">
          <div className="user-details-header">
            <h3>Информация о пользователе</h3>
            <button className="close-button" onClick={closeUserDetails}>×</button>
          </div>
          <div className="user-details-content">
            {loadingUser && (
              <div className="user-loading">
                <span className="spinner-small"></span> Загрузка...
              </div>
            )}
            {userError && (
              <div className="user-error">{userError}</div>
            )}
            {selectedUser && !loadingUser && !userError && (
              <div className="user-info">
                <p><strong>Имя:</strong> {selectedUser.firstName || '—'}</p>
                <p><strong>Chat ID:</strong> {selectedUser.chat_id || '—'}</p>
                <p><strong>Телефон:</strong> {selectedUser.phone || '—'}</p>
                <p><strong>Telegram:</strong> {selectedUser.user_name ||'—'}</p>
                <p><strong>Дата регистрации:</strong> {formatRegistrationDate(selectedUser.createdAt)}</p>
                <p> {
                  selectedUser.blocked_status 
                    ? <span className="blocked-status">Заблокирован</span> 
                    : <span className="active-status">Активен</span>
                }</p>
              </div>
            )}
            {!loadingUser && !selectedUser && !userError && (
              <p>Нет данных о пользователе</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;