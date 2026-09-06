import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch Kategori dari Backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories");
      const data =
        res.data?.data ||
        res.data?.categories ||
        (Array.isArray(res.data) ? res.data : []);
      setCategories(data);
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
      toast.error("Gagal memuat data kategori dari server");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Tambah Kategori Baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama kategori tidak boleh kosong");

    try {
      await API.post("/categories", {
        name,
        type,
      });

      toast.success("Kategori baru berhasil ditambahkan!");
      setName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan kategori");
    }
  };

  const handleDelete = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Kategori",
      message: "Yakin ingin menghapus kategori ini?",
      onConfirm: async () => {
        try {
          await API.delete(`/categories/${id}`);
          toast.success("Kategori berhasil dihapus");
          fetchCategories();
        } catch {
          toast.error("Gagal menghapus kategori");
        }
      },
    });
  };

  const expenseCategories = categories.filter(
    (c) => c.type?.toLowerCase() === "expense"
  );
  const incomeCategories = categories.filter(
    (c) => c.type?.toLowerCase() === "income"
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kelola Kategori Transaksi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Atur pengelompokan jenis pemasukan dan pengeluaran kamu
        </p>
      </div>

      {/* Form Tambah Kategori */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tambah Kategori Baru
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nama Kategori (Contoh: Makanan, Gaji)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="expense">Pengeluaran (-)</option>
            <option value="income">Pemasukan (+)</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-2.5 text-xs transition cursor-pointer"
          >
            Tambah Kategori
          </button>
        </form>
      </div>

      {/* Daftar Kategori (Grid: Pengeluaran & Pemasukan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kategori Pengeluaran */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-red-600 dark:text-red-400">
            Kategori Pengeluaran (-)
          </h3>
          {loading ? (
            <p className="text-gray-400 text-center py-6 text-xs">Memuat...</p>
          ) : expenseCategories.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-xs">Belum ada kategori pengeluaran.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {expenseCategories.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {c.name}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kategori Pemasukan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-green-600 dark:text-green-400">
            Kategori Pemasukan (+)
          </h3>
          {loading ? (
            <p className="text-gray-400 text-center py-6 text-xs">Memuat...</p>
          ) : incomeCategories.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-xs">Belum ada kategori pemasukan.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {incomeCategories.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {c.name}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}