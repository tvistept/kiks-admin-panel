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

const API_BASE_URL = 'https://kiks-app.ru:5000/api';

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
          const clubName = entry.dataKey === 'k1_tb' || entry.dataKey === 'k1_th' 
            ? 'Марата' 
            : 'Каменноостровский';
          const metricType = entry.dataKey.includes('_tb') ? 'броней' : 'часов';
          return (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {clubName}: {entry.value} {metricType}
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
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_BASE_URL}/get-kiks-analytics`);
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Добавляем форматированную дату для отображения
        const formattedData = result.map(item => ({
          ...item,
          formattedDate: formatDate(item.booking_date),
          fullDate: item.booking_date
        }));
        
        setData(formattedData);
      } catch (err) {
        setError(`Ошибка загрузки данных аналитики: ${err.message}` || 'Ошибка загрузки данных аналитики');
        console.error('Ошибка при загрузке аналитики:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []); // Пустой массив зависимостей - запрос при монтировании

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
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="analytics-container">
        <BackButton />
        <div className="empty-state">
          <p>Нет данных для отображения</p>
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
            <h3>Марата</h3>
            <div className="stat-values">
              <div className="stat-item">
                <span className="stat-label">Среднее:</span>
                <span className="stat-value">{stats.k1Avg}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Всего:</span>
                <span className="stat-value">{stats.k1Total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Максимум:</span>
                <span className="stat-value">{stats.k1Max}</span>
              </div>
            </div>
          </div>
          <div className="stat-card club2">
            <h3>Каменноостровский</h3>
            <div className="stat-values">
              <div className="stat-item">
                <span className="stat-label">Среднее:</span>
                <span className="stat-value">{stats.k2Avg}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Всего:</span>
                <span className="stat-value">{stats.k2Total}</span>
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
          <h2>Динамика {selectedMetric === 'tb' ? 'броней' : 'часов'} по дням</h2>
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
                <th colSpan="2">Марата</th>
                <th colSpan="2">Каменноостровский</th>
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