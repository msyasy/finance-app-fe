import axios from 'axios';

// Cek apakah aplikasi sedang berjalan di mode lokal (development)
const isLocal = import.meta.env.DEV;

// Jika lokal gunakan localhost, jika di Vercel/Production PAKSA selalu pakai HTTPS Railway
const baseURL = isLocal
  ? 'http://localhost:8080'
  : 'https://finance-app-be-production.up.railway.app';

const API = axios.create({
  baseURL: `${baseURL}/api`,
});

// Request Interceptor: Menempelkan token ke setiap request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto Logout jika Token Expired / Invalid (Error 401)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus data autentikasi dari browser
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Tendang ke halaman login jika tidak sedang di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH SERVICES ---
export const loginUser = (data) => API.post('/login', data);
export const registerUser = (data) => API.post('/register', data);
export const forgotPassword = (data) => API.post('/forgot-password', data);
export const resetPassword = (data) => API.post('/reset-password', data);

export default API;