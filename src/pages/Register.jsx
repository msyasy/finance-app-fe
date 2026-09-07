import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/register", { name, email, password });
      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registrasi gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-center text-gray-400 mt-1">
            Mulai kelola keuanganmu dengan lebih terstruktur.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Daftar
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}