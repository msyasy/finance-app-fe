import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Gagal mengirim email reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-wide">
            Lupa Password
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Masukkan email akun kamu. Kami akan mengirimkan instruksi untuk
            mereset password.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200 dark:border-emerald-900/50">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-900/50">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-xl transition duration-200 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Kembali ke{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Halaman Login
          </Link>
        </p>
      </div>
    </div>
  );
}