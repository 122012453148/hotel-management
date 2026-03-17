import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
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
