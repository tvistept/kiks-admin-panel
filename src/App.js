import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SchedulerPage from './pages/SchedulerPage';
import SearchUserPage from './pages/SearchUserPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NonWorkingDaysPage from './pages/NonWorkingDaysPage';
import CloseSlotsPage from './pages/CloseSlotsPage';
import DeleteBookingsPage from './pages/DeleteBookingsPage';
import WeekendsPage from './pages/WeekendsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScrollToTop from './components/ScrollToTop';
import './styles/global.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <SearchProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/admin" />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                isAuthenticated ? (
                  <AdminDashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/scheduler"
              element={
                isAuthenticated ? (
                  <SchedulerPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/analytics"
              element={
                isAuthenticated ? (
                  <AnalyticsPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/search" 
              element={
                isAuthenticated ? (
                  <SearchUserPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/non-working" 
              element={
                  isAuthenticated ? (
                    <NonWorkingDaysPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
            />
            <Route 
              path="/admin/weekends" 
              element={
                  isAuthenticated ? (
                    <WeekendsPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
            />
            <Route 
              path="/admin/close-slots" 
              element={
                isAuthenticated ? (
                  <CloseSlotsPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/delete-bookings" 
              element={
                isAuthenticated ? (
                  <DeleteBookingsPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/stats" 
              element={
                isAuthenticated ? (
                  <PlaceholderPage 
                    title="📊 Статистика"
                    description="Аналитика посещений, доходов и активности пользователей"
                    icon="📊"
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                isAuthenticated ? (
                  <PlaceholderPage 
                    title="👥 Все пользователи"
                    description="Полный список пользователей с фильтрами и сортировкой"
                    icon="👥"
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;