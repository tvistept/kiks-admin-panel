import React, { useState, useEffect } from 'react';
// import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/CloseSlotsPage.css';
import { Icon } from '../components/Icons';
const API_BASE_URL = 'https://kiks-app.ru:5000/api';

const CloseSlotsPage = () => {
  // const { isDarkMode } = useTheme();
  const [club, setClub] = useState('kiks1');
  const [table, setTable] = useState('3');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [hours, setHours] = useState('1');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(true);
  
  // Состояние для диалога подтверждения удаления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [closedSlots, setClosedSlots] = useState([]);
  
  // Список доступных столов для каждого клуба
  const availableTables = {
    kiks1: ['3', '4', '5', '6'],
    kiks2: ['3', '4', '6', '7', '8']
  };

  // Загрузка данных при открытии страницы
  useEffect(() => {
    fetchClosedSlots(); 
  },[]);

  // Функция для загрузки закрытых слотов с API
  const fetchClosedSlots = async () => {
    try {
      setFetching(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/get-closed-slots`);
      
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем данные из API в нужный формат
      const formattedSlots = data.map(day => ({
        id: day.id ,
        time: formatTime(day.time),
        hours: day.hours,
        table: day.table,
        club: day.club,
        date: formatDate(day.date),
        signature: day.signature,
      }));
      
      setClosedSlots(formattedSlots);
    } catch (err) {
      console.error('Ошибка загрузки закрытых слотов:', err);
      setError(`Не удалось загрузить закрытые слоты: ${err.message}`);
      
      // Для демонстрации, если API недоступен
      let formattedSlots = getMockData().map(day => ({
        id: day.id ,
        time: formatTime(day.time),
        hours: day.hours,
        table: day.table,
        club: day.club,
        date: formatDate(day.date),
        signature: day.signature,
      }));
      setClosedSlots(formattedSlots);
    } finally {
      setFetching(false);
    }
  };

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

    const dateError = validateDate(date);
    if (dateError) {
      return dateError;
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

    return '';
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
    
     try {
      // Формируем данные для отправки
      const closedSlotData = {
        club_id: club,
        booking_date: formatDateForAPI(date),
        time: time,
        hours: hours,
        table: table,
        user_name: signature.trim(),
      };

      // Отправляем запрос на создание нерабочего дня
      const response = await fetch(`${API_BASE_URL}/create-closed-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closedSlotData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      const responseData = await response.json(); // Сначала получаем полный ответ
      const newClosedSlot = responseData.data; // Затем достаём нужное поле

      // Форматируем новый день для отображения
      const formattedClosedSlot = {
        id: newClosedSlot.booking_id,
        time: formatTime(newClosedSlot.time),
        hours: newClosedSlot.hours,
        table: newClosedSlot.table,
        club: newClosedSlot.club_id,
        date: formatDate(newClosedSlot.booking_date),
        signature: newClosedSlot.user_name,
      };

      const endTime = calculateEndTime(time, hours);
      // const now = new Date();
      // const createdDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      // Сортировка по дате и времени
      const updatedSlots = [...closedSlots, formattedClosedSlot].sort((a, b) => {
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
    } catch (err) {
      console.error('Ошибка добавления закрытого слота:', err);
      setError(`Не удалось добавить закрытый слот: ${err.message}`);
    } finally {
      setLoading(false);
    }
    // Имитация запроса на сервер
    // await new Promise(resolve => setTimeout(resolve, 600));
    
    // const endTime = calculateEndTime(time, hours);
    // const now = new Date();
    // const createdDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // const newSlot = {
    //   id: Date.now(),
    //   club,
    //   table,
    //   date,
    //   time,
    //   hours,
    //   endTime,
    //   signature: signature.trim(),
    //   created: createdDate
    // };

    // // Сортировка по дате и времени
    // const updatedSlots = [...closedSlots, newSlot].sort((a, b) => {
    //   const [dayA, monthA, yearA] = a.date.split('.').map(Number);
    //   const [dayB, monthB, yearB] = b.date.split('.').map(Number);
    //   const dateA = new Date(yearA, monthA - 1, dayA);
    //   const dateB = new Date(yearB, monthB - 1, dayB);
      
    //   if (dateA.getTime() !== dateB.getTime()) {
    //     return dateA - dateB;
    //   }
      
    //   // Если дата одинаковая, сортируем по времени
    //   const [hoursA, minutesA] = a.time.split(':').map(Number);
    //   const [hoursB, minutesB] = b.time.split(':').map(Number);
    //   return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    // });

    // setClosedSlots(updatedSlots);
    // resetForm();
    // setSuccess(`Слот успешно закрыт: ${club}, стол ${table}, ${date} ${time}-${endTime}`);
    // setLoading(false);
  };

  // Сброс формы
  const resetForm = () => {
    setDate('');
    setTime('12:00');
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

    try {
      // Отправляем запрос на удаление
      const response = await fetch(`${API_BASE_URL}/delete-closed-slot/${slotToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }

      // Удаляем день из списка
      setClosedSlots(prev => prev.filter(slot => slot.id !== slotToDelete.id));
      setSuccess(`Закрытый слот удален: ${slotToDelete.club}, стол ${slotToDelete.table}, ${slotToDelete.date} ${slotToDelete.time}`);
      
    } catch (err) {
      console.error('Ошибка удаления закрытого слота:', err);
      setError(`Не удалось удалить закрытый слот: ${err.message}`);
    } finally {
      setSlotToDelete(null);
      setLoading(false);
    }
  };

  // Отмена удаления
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setSlotToDelete(null);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  const formatTime = (time) => {
    const trimmed = time.substring(0, 5);
    return trimmed;
  }

  // Получение сегодняшней даты в нужном формате
  // const getTodayDate = () => {
  //   const today = new Date();
  //   const day = String(today.getDate()).padStart(2, '0');
  //   const month = String(today.getMonth() + 1).padStart(2, '0');
  //   const year = today.getFullYear();
  //   return `${day}.${month}.${year}`;
  // };

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

  // Моковые данные для демонстрации (если API недоступно)
  const getMockData = () => [
  {
    "id": "2408",
    "signature": "live_queue",
    "date": "2025-12-13T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 14,
    "table": 5,
    "club": "kiks1"
  },
  {
    "id": "2311",
    "signature": "KIVACH",
    "date": "2025-12-13T00:00:00.000Z",
    "time": "18:00:00",
    "hours": 5,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2409",
    "signature": "live_queue",
    "date": "2025-12-13T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 14,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2406",
    "signature": "live_queue",
    "date": "2025-12-13T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 14,
    "table": 3,
    "club": "kiks1"
  },
  {
    "id": "2407",
    "signature": "live_queue",
    "date": "2025-12-13T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 14,
    "table": 4,
    "club": "kiks1"
  },
  {
    "id": "2315",
    "signature": "KIVACH",
    "date": "2025-12-20T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2756",
    "signature": "HoReCa",
    "date": "2025-12-22T00:00:00.000Z",
    "time": "18:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2753",
    "signature": "HoReCa",
    "date": "2025-12-22T00:00:00.000Z",
    "time": "18:00:00",
    "hours": 4,
    "table": 3,
    "club": "kiks1"
  },
  {
    "id": "2754",
    "signature": "HoReCa",
    "date": "2025-12-22T00:00:00.000Z",
    "time": "18:00:00",
    "hours": 4,
    "table": 4,
    "club": "kiks1"
  },
  {
    "id": "2755",
    "signature": "HoReCa",
    "date": "2025-12-22T00:00:00.000Z",
    "time": "18:00:00",
    "hours": 4,
    "table": 5,
    "club": "kiks1"
  },
  {
    "id": "2316",
    "signature": "KIVACH",
    "date": "2025-12-27T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2428",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 4,
    "club": "kiks2"
  },
  {
    "id": "2430",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 7,
    "club": "kiks2"
  },
  {
    "id": "2431",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 8,
    "club": "kiks2"
  },
  {
    "id": "2423",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 3,
    "club": "kiks1"
  },
  {
    "id": "2425",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 5,
    "club": "kiks1"
  },
  {
    "id": "2424",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 4,
    "club": "kiks1"
  },
  {
    "id": "2426",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2427",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 3,
    "club": "kiks2"
  },
  {
    "id": "2429",
    "signature": "day_off",
    "date": "2026-01-01T00:00:00.000Z",
    "time": "12:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks2"
  },
  {
    "id": "2317",
    "signature": "KIVACH",
    "date": "2026-01-03T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2318",
    "signature": "KIVACH",
    "date": "2026-01-10T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2319",
    "signature": "KIVACH",
    "date": "2026-01-17T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2320",
    "signature": "KIVACH",
    "date": "2026-01-24T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  },
  {
    "id": "2321",
    "signature": "KIVACH",
    "date": "2026-01-31T00:00:00.000Z",
    "time": "19:00:00",
    "hours": 4,
    "table": 6,
    "club": "kiks1"
  }
]

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
              <div className="form-group pr-club full-width">
                <label htmlFor="club" className="form-label">
                  Клуб
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

              <div className="form-group pr-table">
                <label htmlFor="table" className="form-label">
                  Стол
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
                      Стол {tableNum} {(tableNum === '7') ? '(WOOD ROOM)' : (tableNum === '8') ? '(DARK ROOM)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group pr-datete">
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
                    const digits = inputValue.replace(/\D/g, '');
                    for (let i = 0; i < digits.length; i++) {
                      if (i === 2 || i === 4) {
                        formattedValue += '.';
                      }
                      formattedValue += digits[i];
                    }
                    if (formattedValue.length <= 10) {
                      setDate(formattedValue);
                      setError('');
                    }
                  }}
                  // onChange={(e) => {
                  //   setDate(e.target.value);
                  //   setError('');
                  // }}
                  className="date-input"
                  placeholder="ДД.ММ.ГГГГ"
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group pr-time">
                <label htmlFor="time" className="form-label">
                  Время начала
                </label>
                <select
                  id="hours"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="hours-select"
                  required
                >
                  {['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '00'].map(h => (
                    <option key={h} value={h}>
                      {h}:00
                    </option>
                  ))}
                </select>
                {/* <input
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
                /> */}
              </div>

              <div className="form-group pr-hours">
                <label htmlFor="hours" className="form-label">
                  Часы
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
                      {h} час{(h === 1) ? '' : (h <= 4) ? 'а' : 'ов'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group pr-signature full-width">
                <label htmlFor="signature" className="form-label">
                  Причина закрытия
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
                    {slot.signature && (
                      <div className="slot-signature">
                        {slot.signature}
                      </div>
                    )}
                  </div>
                  
                  <div className="slot-details">
                    <div className="slot-date-time">
                      <span className="slot-date">{slot.date}</span>
                      <span className="slot-time">{formatTimeDisplay(slot)}</span>
                    </div>
                    
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteClick(slot)}
                  className="delete-button"
                  title="Открыть слот"
                  disabled={loading}
                >
                  <Icon name="trash"  />
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