import { useEffect, useRef } from 'react';

const TIMEOUT_IN_MINUTES = 5;
const TIMEOUT_MS = TIMEOUT_IN_MINUTES * 60 * 1000; // 5 menit dalam milidetik

export const useAutoLogout = () => {
  const timerRef = useRef(null);

  const logout = () => {
    // Hapus data sesi
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Alihkan ke halaman login jika tidak sedang di halaman login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const resetTimer = () => {
    // Jika user belum login, tidak perlu aktifkan timer
    const token = localStorage.getItem('token');
    if (!token) return;

    // Bersihkan timer lama dan buat timer baru
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, TIMEOUT_MS);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Daftar event aktivitas user yang dipantau
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Pasang listener & jalankan timer pertama kali
    resetTimer();
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Cleanup listener saat komponen unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);
};