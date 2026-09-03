import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (!token) {
      setError('Token reset password tidak ditemukan di URL');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({ token, new_password: newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mereset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Buat Password Baru</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Masukkan password baru untuk akun kamu.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">
            {message} Mengalihkan ke halaman login...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Simpan Password Baru'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Kembali ke{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}