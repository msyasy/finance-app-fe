import axios from "axios";

// Pastikan menggunakan HTTPS, bukan HTTP
const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://finance-app-be-production.up.railway.app";

const API = axios.create({
  baseURL: `${baseURL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
