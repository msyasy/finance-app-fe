import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Coins,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  // Modal Hapus State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories").catch(() => null);
      if (res?.data) {
        setCategories(res.data.data || res.data.categories || []);
      }
    } catch (err) {
      console.error("Gagal memuat kategori", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Tambah Kategori Baru
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi!");
      return;
    }

    try {
      await API.post("/categories", { name, type });
      toast.success("Kategori berhasil ditambahkan!");
      setName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah kategori");
    }
  };

  // Konfirmasi Hapus Kategori
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await API.delete(`/categories/${deleteTargetId}`);
      toast.success("Kategori berhasil dihapus");
      setDeleteTargetId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus kategori");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Tag size={24} className="text-blue-600 dark:text-blue-400" />
          Kelola Kategori
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Atur kelompok pengeluaran dan pemasukan untuk memudahkan klasifikasi
          riwayat transaksi.
        </p>
      </div>

      {/* Form Tambah Kategori */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tambah Kategori Baru
        </h3>

        <form
          onSubmit={handleAddCategory}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="expense">Pengeluaran (Expense)</option>
              <option value="income">Pemasukan (Income)</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Nama Kategori (contoh: Makanan / Gaji)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={16} /> Tambah Kategori
            </button>
          </div>
        </form>
      </div>

      {/* Grid Kategori Pengeluaran & Pemasukan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Pengeluaran */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingDown size={18} className="text-rose-500" />
            <span>Kategori Pengeluaran ({expenseCategories.length})</span>
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                Belum ada kategori pengeluaran.
              </p>
            ) : (
              expenseCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-gray-200 dark:hover:border-slate-700 transition"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-white">
                    {c.name}
                  </span>
                  <button
                    onClick={() => setDeleteTargetId(c.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Pemasukan */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <span>Kategori Pemasukan ({incomeCategories.length})</span>
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {incomeCategories.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                Belum ada kategori pemasukan.
              </p>
            ) : (
              incomeCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-gray-200 dark:hover:border-slate-700 transition"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-white">
                    {c.name}
                  </span>
                  <button
                    onClick={() => setDeleteTargetId(c.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle size={24} />
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Konfirmasi Hapus
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Apakah kamu yakin ingin menghapus kategori ini? Pastikan tidak ada
              transaksi aktif yang bergantung pada kategori ini.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
