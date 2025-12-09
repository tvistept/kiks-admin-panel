import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/NonWorkingDaysPage.css';
const API_BASE_URL = 'https://kiks-app.ru:5000/api';

const NonWorkingDaysPage = () => {
  const [club, setClub] = useState('kiks1');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для диалога подтверждения удаления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  
  // Моковые данные для демонстрации
  const [nonWorkingDays, setNonWorkingDays] = useState([]);
  // Загрузка данных при открытии страницы
  useEffect(() => {
    fetchDayOffs();
  }, []);

  // Функция для загрузки нерабочих дней с API
  const fetchDayOffs = async () => {
    try {
      setFetching(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/get-dayoffs`);
      
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем данные из API в нужный формат
      const formattedDays = data.map(day => ({
        off_id: day.off_id || day._id,
        club_id: day.club_id || 'all',
        off_date: formatDate(day.off_date),
        off_reason: day.off_reason || '',
        // createdAt: formatDateTime(day.createdAt) || formatDateTime(new Date())
      }));
      
      setNonWorkingDays(formattedDays);
    } catch (err) {
      console.error('Ошибка загрузки нерабочих дней:', err);
      setError(`Не удалось загрузить нерабочие дни: ${err.message}`);
      
      // // Для демонстрации, если API недоступен
      // let formattedDays = getMockData().map(day => ({
      //   off_id: day.off_id || day._id,
      //   club_id: day.club_id || 'all',
      //   off_date: formatDate(day.off_date),
      //   off_reason: day.off_reason || '',
      // }));
      // setNonWorkingDays(formattedDays);
    } finally {
      setFetching(false);
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dateError = validateDate(date);
    if (dateError) {
      setError(dateError);
      setSuccess('');
      return;
    }

    if (!reason.trim()) {
      const reason = 'Причина не может быть пустой';
      setError(reason);
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Формируем данные для отправки
      const dayOffData = {
        club_id: club,
        off_date: formatDateForAPI(date),
        off_reason: reason.trim() || '',
      };

      // Отправляем запрос на создание нерабочего дня
      const response = await fetch(`${API_BASE_URL}/create-dayoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayOffData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      const newDay = await response.json().data;
      console.log(newDay)
      console.log(response)

      // Форматируем новый день для отображения
      const formattedDay = {
        off_id: newDay.off_id || newDay._id,
        club_id: newDay.club_id || club,
        off_date: formatDate(newDay.off_date) || date,
        off_reason: newDay.off_reason || reason.trim() || '',
        // createdAt: formatDateTime(newDay.createdAt) || formatDateTime(new Date())
      };

      // Добавляем новый день в список
      setNonWorkingDays(prev => {
        const updatedDays = [...prev, formattedDay].sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('.').map(Number);
          const [dayB, monthB, yearB] = b.date.split('.').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateA - dateB;
        });
        return updatedDays;
      });

      resetForm();
      setSuccess(`Нерабочий день успешно добавлен: ${getClubName(club)}, ${date}`);
      
    } catch (err) {
      console.error('Ошибка добавления нерабочего дня:', err);
      setError(`Не удалось добавить нерабочий день: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты для API (DD.MM.YYYY → YYYY-MM-DD)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [day, month, year] = dateString.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (err) {
      console.error('Ошибка форматирования даты для API:', err);
      return dateString;
    }
  };

  // Валидация даты
  const validateDate = (dateStr) => {
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

    // Проверка что дата не в прошлом
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return 'Нельзя добавлять прошедшие даты';
    }

    // Проверка на дубликат
    const isDuplicate = nonWorkingDays.some(day => 
      day.club_id === club && 
      day.off_date === dateStr
    );

    if (isDuplicate) {
      const clubName = getClubName(club);
      return `${clubName} уже закрыт на ${dateStr}`;
    }

    return '';
  };

  // Получение названия клуба
  const getClubName = (clubCode) => {
    switch(clubCode) {
      case 'kiks1': return 'Марата';
      case 'kiks2': return 'Каменноостровский';
      default: return '';
    }
  };

  // Открытие диалога удаления
  const handleDeleteClick = (id) => {
    const day = nonWorkingDays.find(d => d.id === id);
    setDayToDelete(day);
    setDialogOpen(true);
  };

  // Подтверждение удаления
  const handleDeleteConfirm = async () => {
    if (!dayToDelete) return;
    
    setLoading(true);
    setDialogOpen(false);
    
    try {
      // Отправляем запрос на удаление
      const response = await fetch(`${API_BASE_URL}/delete-dayoff/${dayToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      // Удаляем день из списка
      setNonWorkingDays(prev => prev.filter(day => day.id !== dayToDelete.id));
      setSuccess(`Нерабочий день удален: ${getClubName(dayToDelete.club)}, ${dayToDelete.date}`);
      
    } catch (err) {
      console.error('Ошибка удаления нерабочего дня:', err);
      setError(`Не удалось удалить нерабочий день: ${err.message}`);
    } finally {
      setDayToDelete(null);
      setLoading(false);
    }
  };

  // Отмена удаления
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setDayToDelete(null);
  };

  // Сброс формы
  const resetForm = () => {
    setClub('kiks1');
    setDate('');
    setReason('');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Фильтрация только будущих дат
  const futureDays = nonWorkingDays.filter(day => {
    const [dayStr, monthStr, yearStr] = day.off_date.split('-').map(Number);
    const dateObj = new Date(yearStr, monthStr - 1, dayStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj >= today;
  });

  // Группировка дней по клубу для отображения
  const groupedDays = futureDays.reduce((groups, day) => {
    const key = day.club_id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(day);
    return groups;
  }, {});

  // Моковые данные для демонстрации (если API недоступно)
  const getMockData = () => [
    {
      "off_id": "66",
      "off_date": "2025-12-31T00:00:00.000Z",
      "club_id": "kiks1",
      "off_reason": "отдыхаем"
    },
    {
      "off_id": "2",
      "off_date": "2025-12-31T00:00:00.000Z",
      "club_id": "kiks2",
      "off_reason": "отдыхаем"
    }
  ];

  return (
    <div className="non-working-container">
      <BackButton />
      
      <div className="non-working-header">
        <h1>Нерабочие дни</h1>
        <p className="page-subtitle">
          Добавляй даты, когда клубы будут закрыты
        </p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="non-working-form">
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="club" className="form-label">
                  Клуб
                </label>
                <select
                  id="club"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="club-select"
                >
                  <option value="kiks1">Марата</option>
                  <option value="kiks2">Каменноостровский</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Дата
                </label>
                <input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    let formattedValue = '';

                    // Оставляем только цифры
                    const digits = inputValue.replace(/\D/g, '');

                    // Формируем строку по маске ДД.ММ.ГГГГ
                    for (let i = 0; i < digits.length; i++) {
                      if (i === 2 || i === 4) {
                        formattedValue += '.';
                      }
                      formattedValue += digits[i];
                    }

                    // Ограничиваем длину до 10 символов
                    if (formattedValue.length <= 10) {
                      setDate(formattedValue);
                      setError('');
                    }
                    // setDate(e.target.value);
                    // setError('');
                  }}
                  className="date-input"
                  placeholder="ДД.ММ.ГГГГ"
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason" className="form-label">
                  Причина
                </label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="reason-input"
                  placeholder="Например: технические работы"
                  maxLength="100"
                />
              </div>
            </div>

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

            <div className="form-actions">
              <button
                type="submit"
                className="add-button"
                disabled={loading || !date}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Добавляем...
                  </>
                ) : (
                  'Добавить нерабочий день'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="list-section">
        <div className="list-header">
          <h2>Запланированные нерабочие дни</h2>
          <div className="list-info">
            <span className="total-count">
              {futureDays.length} дней
            </span>
          </div>
        </div>

        {fetching ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка нерабочих дней...</p>
          </div>
        ) : futureDays.length === 0 ? (
          <div className="empty-state">
            <p>Нет запланированных нерабочих дней</p>
            <p className="empty-hint">Все клубы работают по обычному графику</p>
          </div>
        ) : (
          <div className="days-list">
            {Object.keys(groupedDays).map(clubKey => (
              <div key={clubKey} className="club-group">
                <div className="club-header">
                  <h3 className="club-title">{getClubName(clubKey)}</h3>
                  <span className="club-count">{groupedDays[clubKey].length} дней</span>
                </div>
                <div className="club-days">
                  {groupedDays[clubKey].map((day) => (
                    <div key={day.off_id} className="day-item">
                      <div className="day-info">
                        <span className="day-date">{day.off_date}</span>
                        {day.off_reason && (
                          <span className="day-reason">{day.off_reason}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteClick(day.id)}
                        className="delete-button"
                        title="Удалить"
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="list-footer">
          <p className="disclaimer">
            Прошедшие даты автоматически скрываются из списка
          </p>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Внимание"
        message={`Удалить нерабочий день?\n${getClubName(dayToDelete?.club_id)}, ${dayToDelete?.off_date}${dayToDelete?.off_reason ? ` (${dayToDelete.off_reason})` : ''}`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default NonWorkingDaysPage;