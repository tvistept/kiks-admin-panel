import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/NonWorkingDaysPage.css';

const NonWorkingDaysPage = () => {
  const { isDarkMode } = useTheme();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для диалога подтверждения
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  
  // Моковые данные для демонстрации
  const [nonWorkingDays, setNonWorkingDays] = useState([
    { id: 1, date: '15.03.2026', reason: 'Техническое обслуживание' },
    { id: 2, date: '01.05.2026', reason: 'Праздничный день' },
    { id: 3, date: '09.05.2026', reason: 'День Победы' },
    { id: 4, date: '12.06.2026', reason: 'День России' },
    { id: 5, date: '31.12.2026', reason: 'Новогодние праздники' }
  ]);

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
    if (nonWorkingDays.some(day => day.date === dateStr)) {
      return 'Эта дата уже добавлена как нерабочий день';
    }

    return '';
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
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDay = {
      id: Date.now(),
      date: date,
      reason: reason.trim() || ''
    };

    // Сортировка по дате (от ближайшей к дальней)
    const updatedDays = [...nonWorkingDays, newDay].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });

    setNonWorkingDays(updatedDays);
    setDate('');
    setReason('');
    setSuccess('Нерабочий день успешно добавлен');
    setLoading(false);
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
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setNonWorkingDays(prev => prev.filter(day => day.id !== dayToDelete.id));
    setSuccess(`Нерабочий день ${dayToDelete.date} удален`);
    setDayToDelete(null);
    setLoading(false);
  };

  // Отмена удаления
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setDayToDelete(null);
  };

  // Фильтрация только будущих дат
  const futureDays = nonWorkingDays.filter(day => {
    const [dayStr, monthStr, yearStr] = day.date.split('.').map(Number);
    const dateObj = new Date(yearStr, monthStr - 1, dayStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj >= today;
  });

  return (
    <div className="non-working-container">
      <BackButton />
      
      <div className="non-working-header">
        <h1>Нерабочие дни</h1>
        <p className="page-subtitle">
          Добавляй даты, когда клуб будет закрыт
        </p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="non-working-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Дата
                </label>
                <input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setError('');
                  }}
                  className="date-input"
                  placeholder="ДД.ММ.ГГГГ"
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason" className="form-label">
                  Причина (необязательно)
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

              <button
                type="submit"
                className="add-button"
                disabled={loading || !date}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Добавляю...
                  </>
                ) : (
                  'Добавить'
                )}
              </button>
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
        

        {futureDays.length === 0 ? (
          <div className="empty-state">
            <p>Нет запланированных нерабочих дней</p>
          </div>
        ) : (
          <div className="days-list">
            {futureDays.map((day) => (
              <div key={day.id} className="day-item">
                <div className="day-date">
                  <span className="date-text">{day.date}</span>
                  {day.reason && (
                    <span className="day-reason">— {day.reason}</span>
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
        )}

        <div className="list-footer">
            <p className="disclaimer">
            В эти дни клуб будет закрыт, бронь будет недоступна 
          </p>
          {/* <p className="disclaimer">
            Прошедшие даты автоматически удаляются из списка
          </p> */}
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Удаление нерабочего дня"
        message={`Вы уверены, что хотите удалить нерабочий день ${dayToDelete?.date}${dayToDelete?.reason ? ` (${dayToDelete.reason})` : ''}?`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default NonWorkingDaysPage;