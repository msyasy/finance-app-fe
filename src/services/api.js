import axios from 'axios';

const API = axios.create({
  // WAJIB HTTPS (pakai s)
  baseURL: 'https://finance-app-be-production.up.railway.app/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;