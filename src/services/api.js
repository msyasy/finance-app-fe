import axios from 'axios';

// Di lokal (npm run dev) akan membaca localhost:8080.
// Di Vercel akan otomatis menggunakan nilai VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const API = axios.create({
  baseURL: `${baseURL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;