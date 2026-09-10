import axios from "axios";
import toast from "react-hot-toast";

// 1. Tentukan URL Backend dengan HTTPS Wajib
const isLocal = import.meta.env.DEV;

const defaultBaseURL = isLocal
  ? "http://localhost:8080/api"
  : "https://finance-app-be-production.up.railway.app/api";

// Bersihkan trailing slash jika ada
let baseURL = import.meta.env.VITE_API_URL || defaultBaseURL;
if (baseURL.endsWith("/")) {
  baseURL = baseURL.slice(0, -1);
}

const API = axios.create({
  baseURL,
  timeout: 20000, // 20 detik timeout untuk mengantisipasi cold start backend
});

// 2. Request Interceptor: Tempelkan Token JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3. Response Interceptor: Auto Logout jika 401 & Handling Cold Start Timeout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      toast.error(
        "Server sedang dibangunkan (Cold Start). Silakan coba lagi dalam beberapa detik.",
        {
          id: "cold-start-toast",
        },
      );
    } else if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        toast.error("Sesi kamu telah berakhir. Silakan login kembali.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// --- AUTH SERVICES ---
export const checkServerHealth = () => API.get("/health");
export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);
export const forgotPassword = (data) => API.post("/forgot-password", data);
export const resetPassword = (data) => API.post("/reset-password", data);

export default API;
