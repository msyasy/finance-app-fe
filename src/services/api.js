import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Penentuan Dynamic Base URL
const isLocal = import.meta.env.DEV;

// Prioritaskan dari .env VITE_API_URL, jika tidak ada baru gunakan fallback
const defaultBaseURL = isLocal
  ? 'http://localhost:8080/api'
  : 'https://finance-app-be-production.up.railway.app/api';

const baseURL = import.meta.env.VITE_API_URL || defaultBaseURL;

const API = axios.create({
  baseURL,
});

// 2. Request Interceptor: Menempelkan Token JWT ke setiap Request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Auto Logout jika Token Expired / Invalid (Error 401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        toast.error('Sesi kamu telah berakhir. Silakan login kembali.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = (data) => API.post('/login', data);
export const registerUser = (data) => API.post('/register', data);
export const forgotPassword = (data) => API.post('/forgot-password', data);
export const resetPassword = (data) => API.post('/reset-password', data);

export default API;