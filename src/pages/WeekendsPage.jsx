import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/NonWorkingDaysPage.css';
const API_BASE_URL = 'https://kiks.space:5000/api';

const WeekendsPage = () => {
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
  const [weekendDays, setWeekendDays] = useState([]);
  // Загрузка данных при открытии страницы
  useEffect(() => {
    fetchWeekends();
  }, []);

  // Функция для загрузки выходных дней с API
  const fetchWeekends = async () => {
    try {
      setFetching(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/get-weekends`);
      
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем данные из API в нужный формат
      const formattedDays = data.map(day => ({
        weekend_id: day.weekend_id || day._id,
        weekend_date: formatDate(day.weekend_date),
      }));
      
      setWeekendDays(formattedDays);
    } catch (err) {
      console.error('Ошибка загрузки выходных дней:', err);
      setError(`Не удалось загрузить выходные дни: ${err.message}`);
      
      // // // Для демонстрации, если API недоступен
      // let formattedDays = getMockData().map(day => ({
      //   weekend_id: day.weekend_id || day._id,
      //   weekend_date: formatDate(day.weekend_date),
      // }));
      // setWeekendDays(formattedDays);
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

    setLoading(true);
    setError('');
    
    try {
      // Формируем данные для отправки
      const weekendData = {
        weekend_date: formatDateForAPI(date),
      };

      // Отправляем запрос на создание нерабочего дня
      const response = await fetch(`${API_BASE_URL}/create-weekend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weekendData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      const responseData = await response.json(); // Сначала получаем полный ответ
      const newDay = responseData.data; // Затем достаём нужное поле

      // Форматируем новый день для отображения
      const formattedDay = {
        weekend_id: newDay.weekend_id || newDay._id,
        weekend_date: formatDate(newDay.weekend_date) || date,
      };

      // Добавляем новый день в список
      setWeekendDays(prev => {
        const updatedDays = [...prev, formattedDay].sort((a, b) => {
          const [dayA, monthA, yearA] = a.weekend_date.split('-').map(Number);
          const [dayB, monthB, yearB] = b.weekend_date.split('-').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateA - dateB;
        });
        return updatedDays;
      });

      resetForm();
      setSuccess(`Выходной день успешно добавлен: ${getClubName(club)}, ${date}`);
      
    } catch (err) {
      console.error('Ошибка добавления нерабочего дня:', err);
      setError(`Не удалось добавить выходной день: ${err.message}`);
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
    const isDuplicate = weekendDays.some(day => 
      day.weekend_date === dateStr
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
    const day = weekendDays.find(d => d.weekend_id === id);
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
      const response = await fetch(`${API_BASE_URL}/delete-weekend/${dayToDelete.weekend_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      // Удаляем день из списка
      setWeekendDays(prev => prev.filter(day => day.weekend_id !== dayToDelete.weekend_id));
      setSuccess(`Выходной день удален: ${dayToDelete.weekend_date}`);
      
    } catch (err) {
      console.error('Ошибка удаления нерабочего дня:', err);
      setError(`Не удалось удалить выходной день: ${err.message}`);
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
  const futureDays = weekendDays.filter(day => {
    const [dayStr, monthStr, yearStr] = day.weekend_date.split('-').map(Number);
    const dateObj = new Date(yearStr, monthStr - 1, dayStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj >= today;
  });

  // Моковые данные для демонстрации (если API недоступно)
  const getMockData = () => [
    {
        "weekend_id": "1",
        "weekend_date": "2025-12-31T00:00:00.000Z",
    },
    {
        "weekend_id": "2",
        "weekend_date": "2025-12-31T00:00:00.000Z",
    },
    {
        "weekend_id": "8",
        "weekend_date": "2027-09-29T21:00:00.000Z",
    },
    {
        "weekend_id": "9",
        "weekend_date": "2999-09-29T21:00:00.000Z",
    }
  ];

  return (
    <div className="non-working-container">
      <BackButton />
      
      <div className="non-working-header">
        <h1>Выходные дни</h1>
        <p className="page-subtitle">
          Добавляй даты, когда клубы будут работать по графику выходного дня
        </p>
        <p className="page-subtitle">
          В выходной день клуб начинает работу с 12:00
        </p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="non-working-form">
            <div className="form-fields">
              {/* <div className="form-group">
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
              </div> */}

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
                  'Добавить выходной день'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="list-section">
        <div className="list-header">
          <h2>Запланированные выходные дни</h2>
          <div className="list-info">
            <span className="total-count">
              {futureDays.length} дней
            </span>
          </div>
        </div>

        {fetching ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка выходных дней...</p>
          </div>
        ) : futureDays.length === 0 ? (
          <div className="empty-state">
            <p>Нет запланированных выходных дней</p>
            <p className="empty-hint">Все клубы работают по обычному графику</p>
          </div>
        ) : (
          <div className="days-list">
            <div className="club-days">
              {futureDays.map((day) => (
                <div key={day.weekend_id} className="day-item">
                  <div className="day-info">
                    <span className="day-date">{day.weekend_date}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(day.weekend_id)}
                    className="delete-button"
                    title="Удалить"
                    disabled={loading}
                  >
                    <Icon name="trash"  />
                  </button>
                </div>
              ))}
            </div>
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
        message={`Удалить выходной день?\n${dayToDelete?.weekend_date}`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default WeekendsPage;