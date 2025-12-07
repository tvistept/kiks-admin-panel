import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/DeleteBookingsPage.css';

const DeleteBookingsPage = () => {
  // Состояния для поиска по клубу и дате
  const [searchClub, setSearchClub] = useState('all');
  const [searchDate, setSearchDate] = useState('');
  
  // Состояния для поиска по chat_id
  const [searchByChatId, setSearchByChatId] = useState(false);
  const [searchChatId, setSearchChatId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для диалога подтверждения удаления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  
  // Моковые данные для демонстрации
  const mockBookings = [
    {
      id: 1,
      userName: 'Иван Иванов',
      chatId: '123456789',
      club: 'kiks2',
      date: '25.03.2024',
      time: '14:00',
      endTime: '16:00',
      hours: 2,
      table: '4',
      createdAt: '20.03.2026 10:30'
    },
    {
      id: 2,
      userName: 'Анна Петрова',
      chatId: '987654321',
      club: 'kiks2',
      date: '25.03.2024',
      time: '18:00',
      endTime: '20:00',
      hours: 2,
      table: '6',
      createdAt: '22.03.2026 14:15'
    },
    {
      id: 3,
      userName: 'Сергей Сидоров',
      chatId: '555555555',
      club: 'kiks1',
      date: '26.03.2024',
      time: '20:00',
      endTime: '22:00',
      hours: 2,
      table: '5',
      createdAt: '23.03.2026 09:45'
    },
    {
      id: 4,
      userName: 'Мария Козлова',
      chatId: '111222333',
      club: 'kiks2',
      date: '27.03.2024',
      time: '16:00',
      endTime: '18:00',
      hours: 2,
      table: '7',
      createdAt: '24.03.2026 11:20'
    },
    {
      id: 5,
      userName: 'Алексей Новиков',
      chatId: '123456789',
      club: 'kiks1',
      date: '28.03.2024',
      time: '12:00',
      endTime: '14:00',
      hours: 2,
      table: '3',
      createdAt: '25.03.2026 16:40'
    }
  ];

  const [bookings, setBookings] = useState(mockBookings);
  const [searchResults, setSearchResults] = useState([]);

  // Валидация даты
  const validateDate = (dateStr) => {
    if (!dateStr.trim()) return 'Укажите дату для поиска';
    
    const regex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!regex.test(dateStr)) {
      return 'Дата должна быть в формате ДД.ММ.ГГГГ';
    }

    const [day, month, year] = dateStr.split('.').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return 'Некорректная дата';
    }

    return '';
  };

  // Валидация chat_id
  const validateChatId = (chatId) => {
    if (!chatId.trim()) return 'Введите chat_id для поиска';
    
    if (!/^\d+$/.test(chatId)) {
      return 'Chat_id должен содержать только цифры';
    }
    
    if (chatId.length < 5) {
      return 'Chat_id должен содержать минимум 5 цифр';
    }
    
    return '';
  };

  // Поиск броней
  const handleSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (searchByChatId) {
      const chatIdError = validateChatId(searchChatId);
      if (chatIdError) {
        setError(chatIdError);
        setLoading(false);
        return;
      }
      
      // Имитация запроса на сервер
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const results = bookings.filter(booking => 
        booking.chatId === searchChatId
      );
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError(`Брони с chat_id ${searchChatId} не найдены`);
      } else {
        setSuccess(`Найдено броней: ${results.length}`);
      }
    } else {
      const dateError = validateDate(searchDate);
      if (dateError) {
        setError(dateError);
        setLoading(false);
        return;
      }
      
      // Имитация запроса на сервер
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let results = bookings.filter(booking => 
        booking.date === searchDate
      );
      
      if (searchClub !== 'all') {
        results = results.filter(booking => 
          booking.club === searchClub
        );
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        const clubText = searchClub === 'all' ? '' : ` в клубе ${searchClub === 'kiks1' ? 'Kiks 1' : 'Kiks 2'}`;
        setError(`Брони на ${searchDate}${clubText} не найдены`);
      } else {
        setSuccess(`Найдено броней: ${results.length}`);
      }
    }
    
    setLoading(false);
  };

  // Переключение режима поиска
  const toggleSearchMode = () => {
    setSearchByChatId(!searchByChatId);
    setSearchResults([]);
    setError('');
    setSuccess('');
  };

  // Открытие диалога удаления
  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setDialogOpen(true);
  };

  // Подтверждение удаления
  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    setLoading(true);
    setDialogOpen(false);
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Удаляем из основного списка
    setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
    
    // Удаляем из результатов поиска
    setSearchResults(prev => prev.filter(b => b.id !== bookingToDelete.id));
    
    setSuccess(`Бронь удалена: ${bookingToDelete.userName}, ${bookingToDelete.date} ${bookingToDelete.time}`);
    setBookingToDelete(null);
    setLoading(false);
  };

  // Отмена удаления
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setBookingToDelete(null);
  };

  // Форматирование времени
  const formatTimeDisplay = (booking) => {
    return `${booking.time} - ${booking.endTime}`;
  };

  // Получение названия клуба
  const getClubName = (clubCode) => {
    return clubCode === 'kiks1' ? 'Марата' : 'Каменноостровский';
  };

  return (
    <div className="delete-bookings-container">
      <BackButton />
      
      <div className="delete-bookings-header">
        <h1>Удаление броней</h1>
        <p className="page-subtitle">
          Поиск и удаление существующих бронирований
        </p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <div className="search-mode-toggle">
            <button
              type="button"
              onClick={toggleSearchMode}
              className={`mode-toggle-button ${!searchByChatId ? 'active' : ''}`}
            >
              Поиск по клубу и дате
            </button>
            <button
              type="button"
              onClick={toggleSearchMode}
              className={`mode-toggle-button ${searchByChatId ? 'active' : ''}`}
            >
              Поиск по chat_id
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            {!searchByChatId ? (
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
                    >
                      <option value="all">Все клубы</option>
                      <option value="kiks1">Марата</option>
                      <option value="kiks2">Каменноостровский</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="searchDate" className="form-label">
                      Дата *
                    </label>
                    <input
                      id="searchDate"
                      type="text"
                      value={searchDate}
                      onChange={(e) => {
                        setSearchDate(e.target.value);
                        setError('');
                      }}
                      className="date-input"
                      placeholder="ДД.ММ.ГГГГ"
                      maxLength="10"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="search-button"
                    disabled={loading || !searchDate}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Поиск...
                      </>
                    ) : (
                      'Найти брони'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="search-fields">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="searchChatId" className="form-label">
                      Chat ID пользователя *
                    </label>
                    <input
                      id="searchChatId"
                      type="text"
                      value={searchChatId}
                      onChange={(e) => {
                        setSearchChatId(e.target.value);
                        setError('');
                      }}
                      className="chatid-input"
                      placeholder="Введите chat_id"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="search-button"
                    disabled={loading || !searchChatId}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Поиск...
                      </>
                    ) : (
                      'Найти брони'
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}
          </form>

          
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Результаты поиска</h2>
            <div className="results-info">
              <span className="results-count">
                Найдено: {searchResults.length}
              </span>
            </div>
          </div>

          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Клуб</th>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Стол</th>
                  <th>Часы</th>
                  <th>Chat ID</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((booking) => (
                  <tr key={booking.id} className="booking-row">
                    <td className="user-cell">
                      <div className="user-info">
                        <span className="user-name">{booking.userName}</span>
                      </div>
                    </td>
                    <td className="club-cell">
                      <span className={`club-badge ${booking.club}`}>
                        {getClubName(booking.club)}
                      </span>
                    </td>
                    <td className="date-cell">
                      <span className="date-text">{booking.date}</span>
                    </td>
                    <td className="time-cell">
                      <span className="time-text">{booking.time}</span>
                    </td>
                    <td className="table-cell">
                      <span className="table-number">Стол {booking.table}</span>
                    </td>
                    <td className="hours-cell">
                      <span className="hours-count">{booking.hours} ч</span>
                    </td>
                    <td className="chatid-cell">
                      <code className="chatid-code">{booking.chatId}</code>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="delete-booking-button"
                        title="Удалить бронь"
                        disabled={loading}
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          width="16" 
                          height="16"
                        >
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="table-info">
              Всего найдено броней: {searchResults.length}
            </p>
          </div>
        </div>
      )}

      {searchResults.length === 0 && (searchDate || searchChatId) && (
        <div className="empty-results">
          <p>Брони не найдены</p>
          <p className="empty-hint">
            {searchByChatId 
              ? 'Попробуйте другой chat_id' 
              : 'Попробуйте другую дату или выберите другой клуб'}
          </p>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Удаление брони"
        message={`Вы уверены, что хотите удалить бронь?\n${bookingToDelete?.userName}, ${getClubName(bookingToDelete?.club)}, ${bookingToDelete?.date} ${bookingToDelete?.time}`}
        confirmText="Удалить бронь"
        cancelText="Отмена"
      />
    </div>
  );
};

export default DeleteBookingsPage;