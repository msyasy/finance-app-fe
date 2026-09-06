import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/login", { email, password });
      
      // 1. Simpan Token
      const token = response.data.token || response.data.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // 2. Simpan Data User (agar nama di Dashboard berubah dinamis)
      const userData = response.data.user || response.data.data?.user;
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || "Login gagal, periksa email & password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-wide">
            Revenue & Expense<span className="text-blue-600">.Overview</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Masuk ke akun kamu untuk mengelola keuangan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Lupa Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-xl transition duration-200 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}