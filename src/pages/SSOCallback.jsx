// src/pages/SSOCallback.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function SSOCallback() {
  const [error, setError] = useState("");
  // StrictMode menjalankan effect dua kali saat development,
  // sedangkan kode SSO hanya bisa dipakai sekali.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = sessionStorage.getItem("sso_state");
    sessionStorage.removeItem("sso_state");

    // Hapus kode dari URL dan riwayat browser secepat mungkin.
    window.history.replaceState({}, "", "/sso/callback");

    if (!code || !state || !savedState || state !== savedState) {
      setError("Sesi login tidak valid. Silakan coba masuk lagi.");
      return;
    }

    API.post("/sso/exchange", { code })
      .then(({ data }) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.replace("/dashboard");
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            "Masuk dengan LowonganKita gagal. Silakan coba lagi.",
        );
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 w-full max-w-md text-center space-y-4">
        {error ? (
          <>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
            >
              Kembali ke halaman masuk
            </Link>
          </>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Memverifikasi akun LowonganKita kamu... Kalau server sedang bangun, ini bisa sampai satu menit.
          </p>
        )}
      </div>
    </div>
  );
}
