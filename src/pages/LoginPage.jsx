import React, { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/LoginPage.css';
import kiksLogo from '../images/kiks_logo.png';

const LoginPage = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // В реальном приложении здесь будет проверка с сервером
    // Для демо используем простой код "admin123"
    if (accessCode === 'admin123') {
      setError('');
      onLogin();
    } else {
      setError('Неверный код доступа');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <ThemeToggle />
      </div>
      <div className="login-card">
        <div className="logo-container">
          <img 
            src={kiksLogo} 
            alt="KIKS Бильярдный клуб" 
            className="login-logo"
          />
        </div>
        <h1 className="login-title">KIKS</h1>
        <p className="login-subtitle">Введи код доступа для входа в систему</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            {/* <label htmlFor="accessCode" className="input-label">
              Код доступа
            </label> */}
            <input
              id="accessCode"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="input-field"
              placeholder="Введи код"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
        
        <div className="login-hint">
          <p>Для демонстрации используй код: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;