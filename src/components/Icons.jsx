import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // Solid icons
  faSearch,
  faCalendarXmark,
  faClock,
  faTrash,
  faChartBar,
  faUsers,
  faCube,
  faSignOutAlt,
  faMoon,
  faSun,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faMobileAlt,
  faBars,
  faUser,
  faPhone,
  faBan,
  faCalendarDay,
  faTimes,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faRefresh,
  faCalendarCheck,
  faExclamationCircle,
  faSpinner,
  faCalendarPlus,
  
  // Regular icons (если нужны)
  faCalendarAlt,
  faUser as faUserRegular
} from '@fortawesome/free-solid-svg-icons';

// Экспортируем иконки для использования
export const Icons = {
  search: faSearch,
  calendarXmark: faCalendarXmark,
  clock: faClock,
  trash: faTrash,
  chartBar: faChartBar,
  users: faUsers,
  cube: faCube,
  signOut: faSignOutAlt,
  moon: faMoon,
  sun: faSun,
  arrowRight: faArrowRight,
  arrowLeft: faArrowLeft,
  plus: faPlus,
  mobile: faMobileAlt,
  bars: faBars,
  user: faUser,
  phone: faPhone,
  ban: faBan,
  calendarDay: faCalendarDay,
  times: faTimes,
  info: faInfoCircle,
  warning: faExclamationTriangle,
  success: faCheckCircle,
  calendarAlt: faCalendarAlt,
  userRegular: faUserRegular,
  refresh: faRefresh,
  calendarCheck: faCalendarCheck,
  exclamationCircle: faExclamationCircle,
  checkCircle: faCheckCircle,
  spinner: faSpinner,
  calendarPlus: faCalendarPlus,
  
  // Алиасы для удобства
  loading: faSpinner
};

// Компонент иконки с настройками по умолчанию
export const Icon = ({ name, size = 'lg', color, className = '', ...props }) => {
  const icon = Icons[name];
  if (!icon) {
    console.warn(`Иконка "${name}" не найдена`);
    return null;
  }
  
  return (
    <FontAwesomeIcon 
      icon={icon} 
      size={size}
      color={color}
      className={`icon ${className}`}
      {...props}
    />
  );
};

// Компоненты для конкретных иконок (опционально)
export const SearchIcon = (props) => <Icon name="search" {...props} />;
export const CalendarXmarkIcon = (props) => <Icon name="calendarXmark" {...props} />;
export const ClockIcon = (props) => <Icon name="clock" {...props} />;
export const TrashIcon = (props) => <Icon name="trash" {...props} />;
export const ChartBarIcon = (props) => <Icon name="chartBar" {...props} />;
export const UsersIcon = (props) => <Icon name="users" {...props} />;
export const CubeIcon = (props) => <Icon name="cube" {...props} />;
export const SignOutIcon = (props) => <Icon name="signOut" {...props} />;
export const MoonIcon = (props) => <Icon name="moon" {...props} />;
export const SunIcon = (props) => <Icon name="sun" {...props} />;
export const ArrowRightIcon = (props) => <Icon name="arrowRight" {...props} />;
export const PlusIcon = (props) => <Icon name="plus" {...props} />;
export const MobileIcon = (props) => <Icon name="mobile" {...props} />;