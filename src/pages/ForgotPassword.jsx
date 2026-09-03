import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim email reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Lupa Password</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Masukkan email akun kamu. Kami akan mengirimkan instruksi untuk mereset password.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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