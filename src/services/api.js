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

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;