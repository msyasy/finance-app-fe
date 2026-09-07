import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TIMEOUT_IN_MINUTES = 5;
const TIMEOUT_MS = TIMEOUT_IN_MINUTES * 60 * 1000;

export const useAutoLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const logout = () => {
    // Hapus data sesi dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Beri pemberitahuan
    toast.error('Kamu tidak aktif selama 5 menit. Silakan login kembali.', {
      id: 'auto-logout-toast',
    });

    // Navigasi ke halaman login
    navigate('/login', { replace: true });
  };

  const resetTimer = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, TIMEOUT_MS);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Pasang timer & event listener
    resetTimer();
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Cleanup listener
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);
};

export default useAutoLogout;