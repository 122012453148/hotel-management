import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Role-specific storage keys — must match AuthContext.jsx
const STORAGE_KEYS = ['customerInfo', 'managerInfo', 'adminInfo'];

// Helper: find the token from whichever role-session matches the current portal
const getTokenFromStorage = () => {
  const path = window.location.pathname;

  // Pick the right key based on the current URL portal
  if (path.startsWith('/manager')) {
    const raw = localStorage.getItem('managerInfo');
    if (raw) return JSON.parse(raw).token;
  } else if (path.startsWith('/admin')) {
    const raw = localStorage.getItem('adminInfo');
    if (raw) return JSON.parse(raw).token;
  } else {
    const raw = localStorage.getItem('customerInfo');
    if (raw) return JSON.parse(raw).token;
  }
  return null;
};

// Helper: clear the session for the current portal on 401
const clearCurrentSession = () => {
  const path = window.location.pathname;
  if (path.startsWith('/manager')) localStorage.removeItem('managerInfo');
  else if (path.startsWith('/admin'))   localStorage.removeItem('adminInfo');
  else                                  localStorage.removeItem('customerInfo');
};

// Add a request interceptor to attach the correct auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearCurrentSession();
      // Only redirect if not already on a login/auth page to avoid loops
      const path = window.location.pathname;
      const isAuthPage = path.includes('/login') ||
                         path === '/admin' ||
                         path === '/manager-login' ||
                         path === '/register';
      if (!isAuthPage) {
        if (path.startsWith('/admin')) {
          window.location.href = '/admin?expired=true';
        } else if (path.startsWith('/manager')) {
          window.location.href = '/manager-login?expired=true';
        } else {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
