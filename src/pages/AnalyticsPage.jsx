import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import BackButton from '../components/BackButton';
import '../styles/AnalyticsPage.css';

// Данные из файла (в реальном проекте здесь будет fetch)
const bookingsWeekData = [
  {
    "booking_date": "04-03-2026",
    "k1_tb": 28,
    "k1_th": 44,
    "k2_tb": 17,
    "k2_th": 29
  },
  {
    "booking_date": "05-03-2026",
    "k1_tb": 29,
    "k1_th": 40,
    "k2_tb": 24,
    "k2_th": 41
  },
  {
    "booking_date": "06-03-2026",
    "k1_tb": 29,
    "k1_th": 44,
    "k2_tb": 24,
    "k2_th": 39
  },
  {
    "booking_date": "07-03-2026",
    "k1_tb": 35,
    "k1_th": 52,
    "k2_tb": 34,
    "k2_th": 58
  },
  {
    "booking_date": "08-03-2026",
    "k1_tb": 42,
    "k1_th": 55,
    "k2_tb": 44,
    "k2_th": 65
  },
  {
    "booking_date": "09-03-2026",
    "k1_tb": 32,
    "k1_th": 47,
    "k2_tb": 35,
    "k2_th": 56
  },
  {
    "booking_date": "10-03-2026",
    "k1_tb": 20,
    "k1_th": 32,
    "k2_tb": 16,
    "k2_th": 26
  }
];

// Функция для форматирования даты из ДД-ММ-ГГГГ в более читаемый вид
const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return `${day}.${month}`; // Показываем только день и месяц для компактности
};

// Кастомный тултип
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{label}</p>
        {payload.map((entry, index) => {
          const clubName = entry.dataKey === 'k1_tb' ? 'Марата' : 'Каменноостровский';
          return (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {clubName}: {entry.value} броней
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('tb'); // 'tb' или 'th'
  const [showBrush, setShowBrush] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных (в реальном проекте здесь будет fetch)
    const loadData = async () => {
      try {
        setLoading(true);
        // Здесь будет реальный запрос к API
        // const response = await fetch(`${API_BASE_URL}/analytics/week-bookings`);
        // const result = await response.json();
        
        // Пока используем локальные данные
        setTimeout(() => {
          // Добавляем форматированную дату для отображения
          const formattedData = bookingsWeekData.map(item => ({
            ...item,
            formattedDate: formatDate(item.booking_date),
            fullDate: item.booking_date
          }));
          setData(formattedData);
          setLoading(false);
        }, 500); // Имитация задержки
      } catch (err) {
        setError('Ошибка загрузки данных');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Получаем уникальные даты для оси X
  const xAxisDates = data.map(item => item.formattedDate);

  // Функция для переключения метрики
  const toggleMetric = (metric) => {
    setSelectedMetric(metric);
  };

  // Функция для расчета статистики
  const calculateStats = () => {
    if (data.length === 0) return null;

    const k1Values = data.map(item => selectedMetric === 'tb' ? item.k1_tb : item.k1_th);
    const k2Values = data.map(item => selectedMetric === 'tb' ? item.k2_tb : item.k2_th);

    const k1Avg = (k1Values.reduce((a, b) => a + b, 0) / k1Values.length).toFixed(1);
    const k2Avg = (k2Values.reduce((a, b) => a + b, 0) / k2Values.length).toFixed(1);
    const k1Total = k1Values.reduce((a, b) => a + b, 0);
    const k2Total = k2Values.reduce((a, b) => a + b, 0);
    const k1Max = Math.max(...k1Values);
    const k2Max = Math.max(...k2Values);

    return {
      k1Avg,
      k2Avg,
      k1Total,
      k2Total,
      k1Max,
      k2Max
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="analytics-container">
        <BackButton />
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Загрузка данных аналитики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <BackButton />
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <BackButton />

      <div className="analytics-header">
        <h1>Аналитика броней</h1>
        <p className="page-subtitle">
          Статистика за период: {data.length > 0 ? `${data[0].fullDate} — ${data[data.length-1].fullDate}` : ''}
        </p>
      </div>

      <div className="metrics-toggle">
        <button 
          className={`metric-button ${selectedMetric === 'tb' ? 'active' : ''}`}
          onClick={() => toggleMetric('tb')}
        >
          Количество броней
        </button>
        <button 
          className={`metric-button ${selectedMetric === 'th' ? 'active' : ''}`}
          onClick={() => toggleMetric('th')}
        >
          Количество часов
        </button>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card club1">
            <h3>Клуб на Марата</h3>
            <div className="stat-values">
              <div className="stat-item">
                <span className="stat-label">Среднее:</span>
                <span className="stat-value">{selectedMetric === 'tb' ? stats.k1Avg : (stats.k1Avg * 1).toFixed(1)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Всего:</span>
                <span className="stat-value">{selectedMetric === 'tb' ? stats.k1Total : stats.k1Total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Максимум:</span>
                <span className="stat-value">{stats.k1Max}</span>
              </div>
            </div>
          </div>
          <div className="stat-card club2">
            <h3>Клуб на Каменноостровском</h3>
            <div className="stat-values">
              <div className="stat-item">
                <span className="stat-label">Среднее:</span>
                <span className="stat-value">{selectedMetric === 'tb' ? stats.k2Avg : (stats.k2Avg * 1).toFixed(1)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Всего:</span>
                <span className="stat-value">{selectedMetric === 'tb' ? stats.k2Total : stats.k2Total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Максимум:</span>
                <span className="stat-value">{stats.k2Max}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <div className="chart-header">
          <h2>Динамика броней по дням</h2>
          <label className="brush-toggle">
            <input 
              type="checkbox" 
              checked={showBrush} 
              onChange={() => setShowBrush(!showBrush)} 
            />
            Показать навигацию
          </label>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                return value === 'k1_tb' || value === 'k1_th' 
                  ? 'Клуб на Марата' 
                  : 'Клуб на Каменноостровском';
              }}
            />
            {showBrush && (
              <Brush 
                dataKey="formattedDate" 
                height={30} 
                stroke="#f472b6"
                fill="#fce4f0"
                travellerWidth={10}
              />
            )}
            
            {/* Линии для первого клуба */}
            <Line
              type="monotone"
              dataKey={selectedMetric === 'tb' ? 'k1_tb' : 'k1_th'}
              stroke="#f472b6"
              strokeWidth={3}
              dot={{ r: 6, fill: '#f472b6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: '#f472b6', stroke: '#fff' }}
              name="Марата"
            />
            
            {/* Линии для второго клуба */}
            <Line
              type="monotone"
              dataKey={selectedMetric === 'tb' ? 'k2_tb' : 'k2_th'}
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 6, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: '#60a5fa', stroke: '#fff' }}
              name="Каменноостровский"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-container">
        <h2>Детальные данные</h2>
        <div className="table-scroll">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th colSpan="2">Клуб на Марата</th>
                <th colSpan="2">Клуб на Каменноостровском</th>
              </tr>
              <tr>
                <th></th>
                <th>Брони</th>
                <th>Часы</th>
                <th>Брони</th>
                <th>Часы</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.fullDate}</td>
                  <td>{item.k1_tb}</td>
                  <td>{item.k1_th}</td>
                  <td>{item.k2_tb}</td>
                  <td>{item.k2_th}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Итого</strong></td>
                <td><strong>{data.reduce((acc, item) => acc + item.k1_tb, 0)}</strong></td>
                <td><strong>{data.reduce((acc, item) => acc + item.k1_th, 0)}</strong></td>
                <td><strong>{data.reduce((acc, item) => acc + item.k2_tb, 0)}</strong></td>
                <td><strong>{data.reduce((acc, item) => acc + item.k2_th, 0)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;