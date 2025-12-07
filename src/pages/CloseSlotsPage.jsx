import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/CloseSlotsPage.css';

const CloseSlotsPage = () => {
  const { isDarkMode } = useTheme();
  const [club, setClub] = useState('kiks1');
  const [table, setTable] = useState('3');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState('1');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для диалога подтверждения удаления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  
  // Список доступных столов для каждого клуба
  const availableTables = {
    kiks1: ['3', '4', '5', '6'],
    kiks2: ['3', '4', '6', '7', '8']
  };

  // Моковые данные для демонстрации
  const [closedSlots, setClosedSlots] = useState([
    { 
      id: 1, 
      club: 'kiks1', 
      table: '4', 
      date: '20.03.2026', 
      time: '14:00', 
      hours: '2', 
      signature: 'Техническое обслуживание',
      created: '15.03.2024 10:30'
    },
    { 
      id: 2, 
      club: 'kiks2', 
      table: '6', 
      date: '22.03.2026', 
      time: '18:00', 
      hours: '3', 
      signature: 'Частное мероприятие',
      created: '18.03.2024 14:20'
    },
    { 
      id: 3, 
      club: 'kiks1', 
      table: '5', 
      date: '25.03.2026', 
      time: '20:00', 
      hours: '1', 
      signature: '',
      created: '20.03.2024 09:15'
    },
    { 
      id: 4, 
      club: 'kiks1', 
      table: '5', 
      date: '25.04.2026', 
      time: '20:00', 
      hours: '1', 
      signature: '',
      created: '20.03.2026 09:15'
    }
    
  ]);

  // Обработка изменения клуба
  const handleClubChange = (e) => {
    const newClub = e.target.value;
    setClub(newClub);
    // Сбрасываем стол на первый доступный для выбранного клуба
    setTable(availableTables[newClub][0]);
  };

  // Валидация формы
  const validateForm = () => {
    if (!date.trim()) {
      return 'Укажите дату';
    }

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(date)) {
      return 'Дата должна быть в формате ДД.ММ.ГГГГ';
    }

    if (!time.trim()) {
      return 'Укажите время начала';
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return 'Время должно быть в формате ЧЧ:ММ (24 часа)';
    }

    if (!hours || parseInt(hours) < 1 || parseInt(hours) > 12) {
      return 'Количество часов должно быть от 1 до 12';
    }

    if (!signature.trim()) {
      return 'Укажите причину закрытия';
    }

    // Проверка на дубликат
    const isDuplicate = closedSlots.some(slot => 
      slot.club === club && 
      slot.table === table && 
      slot.date === date && 
      slot.time === time
    );

    if (isDuplicate) {
      return 'Этот слот уже закрыт';
    }

    return '';
  };

  // Расчет времени окончания
  const calculateEndTime = (startTime, hoursCount) => {
    const [hoursStr, minutesStr] = startTime.split(':');
    let hoursNum = parseInt(hoursStr);
    let minutesNum = parseInt(minutesStr);
    
    hoursNum += parseInt(hoursCount);
    
    // Если больше 24 часов, переводим в следующий день
    if (hoursNum >= 24) {
      hoursNum -= 24;
    }
    
    const formattedHours = hoursNum.toString().padStart(2, '0');
    const formattedMinutes = minutesNum.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const endTime = calculateEndTime(time, hours);
    const now = new Date();
    const createdDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newSlot = {
      id: Date.now(),
      club,
      table,
      date,
      time,
      hours,
      endTime,
      signature: signature.trim(),
      created: createdDate
    };

    // Сортировка по дате и времени
    const updatedSlots = [...closedSlots, newSlot].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      
      // Если дата одинаковая, сортируем по времени
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });

    setClosedSlots(updatedSlots);
    resetForm();
    setSuccess(`Слот успешно закрыт: ${club}, стол ${table}, ${date} ${time}-${endTime}`);
    setLoading(false);
  };

  // Сброс формы
  const resetForm = () => {
    setDate('');
    setTime('');
    setHours('1');
    setSignature('');
  };

  // Открытие диалога удаления
  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setDialogOpen(true);
  };

  // Подтверждение удаления
  const handleDeleteConfirm = async () => {
    if (!slotToDelete) return;
    
    setLoading(true);
    setDialogOpen(false);
    
    // Имитация запроса на сервер
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setClosedSlots(prev => prev.filter(slot => slot.id !== slotToDelete.id));
    setSuccess(`Закрытый слот удален: ${slotToDelete.club}, стол ${slotToDelete.table}, ${slotToDelete.date} ${slotToDelete.time}`);
    setSlotToDelete(null);
    setLoading(false);
  };

  // Отмена удаления
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setSlotToDelete(null);
  };

  // Получение сегодняшней даты в нужном формате
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Фильтрация только будущих слотов
  const futureSlots = closedSlots.filter(slot => {
    const [dayStr, monthStr, yearStr] = slot.date.split('.').map(Number);
    const slotDate = new Date(yearStr, monthStr - 1, dayStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return slotDate >= today;
  });

  // Форматирование времени для отображения
  const formatTimeDisplay = (slot) => {
    const endTime = calculateEndTime(slot.time, slot.hours);
    return `${slot.time} - ${endTime} (${slot.hours} ч)`;
  };

  return (
    <div className="close-slots-container">
      <BackButton />
      
      <div className="close-slots-header">
        <h1>Закрытие слотов</h1>
        <p className="page-subtitle">
          Закрывай слоты для бронирования на определенное время.
        </p>
        <p className="page-subtitle">
          Перед закрытием убедись, что не перекроешь существующие пользовательские брони.
        </p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="close-slots-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="club" className="form-label">
                  Клуб *
                </label>
                <select
                  id="club"
                  value={club}
                  onChange={handleClubChange}
                  className="club-select"
                  required
                >
                  <option value="kiks1">ул. Марата</option>
                  <option value="kiks2">Каменноостровский пр.</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="table" className="form-label">
                  Стол *
                </label>
                <select
                  id="table"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="table-select"
                  required
                >
                  {availableTables[club].map(tableNum => (
                    <option key={tableNum} value={tableNum}>
                      Стол {tableNum}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Дата *
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
                <label htmlFor="time" className="form-label">
                  Время начала *
                </label>
                <input
                  id="time"
                  type="text"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setError('');
                  }}
                  className="time-input"
                  placeholder="ЧЧ:ММ"
                  maxLength="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hours" className="form-label">
                  Часы *
                </label>
                <select
                  id="hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="hours-select"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <option key={h} value={h.toString()}>
                      {h} час{h !== 1 ? 'а' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="signature" className="form-label">
                  Причина закрытия *
                </label>
                <input
                  id="signature"
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="signature-input"
                  placeholder="Например: техническое обслуживание"
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
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Закрываю слот...
                  </>
                ) : (
                  'Закрыть слот'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="list-section">
        <div className="list-header">
          <h2>Закрытые слоты</h2>
          <div className="list-info">
            <span className="total-count">
              {futureSlots.length} слотов
            </span>
          </div>
        </div>

        {futureSlots.length === 0 ? (
          <div className="empty-state">
            <p>Нет закрытых слотов</p>
          </div>
        ) : (
          <div className="slots-list">
            {futureSlots.map((slot) => (
              <div key={slot.id} className="slot-item">
                <div className="slot-main">
                  <div className="slot-header">
                    <span className="slot-club">{slot.club === 'kiks1' ? 'ул. Марата' : 'Каменноостровский пр.'}</span>
                    <span className="slot-table">Стол {slot.table}</span>
                  </div>
                  
                  <div className="slot-details">
                    <div className="slot-date-time">
                      <span className="slot-date">{slot.date}</span>
                      <span className="slot-time">{formatTimeDisplay(slot)}</span>
                    </div>
                    
                    {slot.signature && (
                      <div className="slot-signature">
                        {slot.signature}
                      </div>
                    )}
                    
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteClick(slot)}
                  className="delete-button"
                  title="Открыть слот"
                  disabled={loading}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    width="18" 
                    height="18"
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
            Прошедшие закрытые слоты автоматически скрываются из списка
          </p>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Внимание"
        message={`Удалить закрытый слот?\n${slotToDelete?.club === 'kiks1' ? 'ул. Марата' : 'Каменноостровский пр.'}, стол ${slotToDelete?.table}, ${slotToDelete?.date} ${slotToDelete?.time}`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default CloseSlotsPage;