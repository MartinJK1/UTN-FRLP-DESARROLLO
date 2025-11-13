// Configuración de APIs para el proyecto
// Vite solo expone variables que empiezan con VITE_ y deben estar disponibles en tiempo de build
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Debug: mostrar qué URL se está usando (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔧 API Config - VITE_API_URL:', envUrl);
    console.log('🔧 API Config - Todas las vars:', import.meta.env);
  }
  
  if (envUrl) {
    // Limpiar la URL (quitar barras finales) y agregar /api
    const cleanUrl = envUrl.replace(/\/+$/, ''); // Quita una o más barras al final
    return `${cleanUrl}/api`;
  }
  
  // Fallback para desarrollo local
  return 'http://localhost:3000/api';
};

const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 8000 // Timeout general
};

// Log en producción también para debug (se puede quitar después)
console.log('🌐 API Base URL:', API_CONFIG.baseURL);


// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    RECOVER_PASSWORD: '/auth/request-password-recovery',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // Usuarios
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    SEARCH: '/users/search'
  },
  
  // Vehículos
  VEHICLES: {
    LIST: '/vehicles',
    CREATE: '/vehicles',
    UPDATE: (id) => `/vehicles/${id}`,
    DELETE: (id) => `/vehicles/${id}`,
    BY_USER: (userId) => '/vehicles', 
    ALL_FOR_ADMIN: '/vehicles/all'
  },
  
  // Reservas
  RESERVATIONS: {
    LIST: '/reservations', 
    MY: '/reservations/my', 
    CREATE: '/reservations',
    UPDATE: (id) => `/reservations/${id}`,
    DELETE: (id) => `/reservations/${id}`,
    BY_USER: (userId) => `/reservations/user/${userId}`, 
    BY_DATE: (date) => `/reservations/date/${date}`,
    BY_MONTH: (year, month) => `/reservations/month/${year}/${month}`,
    CANCEL: (id) => `/reservations/${id}/cancel`
  },
  
  // Servicios
  SERVICES: {
    LIST: '/services',
    CREATE: '/services',
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
    BY_CATEGORY: (category) => `/services/category/${category}`
  },
  
  // Historial de servicios
  SERVICE_HISTORY: {
    LIST: '/services/history/all',
    CREATE: '/services/history',
    BY_VEHICLE: (patente) => `/services/history/vehicle?patente=${patente}`,
    BY_USER: (userId) => `/services/history/user/${userId}`,
    STATS: '/services/history/stats',
    UPDATE: (id) => `/services/history/${id}`,
    DELETE: (id) => `/services/history/${id}`
  }
};

// Headers por defecto
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
};

export const getApiConfig = () => {
  return API_CONFIG;
};

