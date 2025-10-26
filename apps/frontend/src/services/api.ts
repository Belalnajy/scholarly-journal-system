import axios from 'axios';

// Base URL - يمكن تغييره من .env
// Vite uses import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't logout for these endpoints (expected 401 for wrong credentials)
      const isLoginEndpoint = error.config?.url?.includes('/auth/login');
      const isVerifyPassword = error.config?.url?.includes('/verify-password');
      const isForgotPassword = error.config?.url?.includes('/auth/forgot-password');
      const isVerifyResetCode = error.config?.url?.includes('/auth/verify-reset-code');
      const isResetPassword = error.config?.url?.includes('/auth/reset-password');
      
      // Only redirect if it's NOT one of the auth endpoints
      if (!isLoginEndpoint && !isVerifyPassword && !isForgotPassword && !isVerifyResetCode && !isResetPassword) {
        // Redirect to login for other 401 errors (expired token, etc.)
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
