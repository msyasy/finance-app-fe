import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data || []);
    } catch {
      toast.error("Gagal memuat master kategori");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama kategori tidak boleh kosong");

    try {
      await API.post("/categories", { name: name.trim(), type });
      toast.success("Kategori berhasil ditambahkan!");
      setName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membuat kategori");
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) return toast.error("Nama kategori tidak boleh kosong");

    try {
      await API.put(`/categories/${id}`, { name: editName.trim() });
      toast.success("Kategori berhasil diperbarui!");
      setEditingId(null);
      setEditName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal memperbarui kategori");
    }
  };

  const handleDeleteCategory = (id, catName) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Kategori",
      message: `Yakin ingin menghapus kategori "${catName}"? Kategori yang sudah dipakai di transaksi tidak akan dapat dihapus.`,
      onConfirm: async () => {
        try {
          await API.delete(`/categories/${id}`);
          toast.success("Kategori berhasil dihapus!");
          fetchCategories();
        } catch (err) {
          toast.error(
            err.response?.data?.error ||
              "Gagal menghapus kategori. Pastikan tidak ada transaksi yang menggunakan kategori ini."
          );
        }
      },
    });
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kelola Kategori
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Atur pengelompokan jenis transaksi pemasukan dan pengeluaran kamu
        </p>
      </div>

      {/* Form Tambah Kategori */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tambah Kategori Baru
        </h3>
        <form
          onSubmit={handleCreateCategory}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="expense">Pengeluaran (-)</option>
            <option value="income">Pemasukan (+)</option>
          </select>

          <input
            type="text"
            placeholder="Nama Kategori (contoh: Makanan, Gaji, Service)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="md:col-span-2 p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl p-3 text-xs transition cursor-pointer"
          >
            + Simpan Kategori
          </button>
        </form>
      </div>

      {/* Daftar Kategori Dua Kolom (Pengeluaran vs Pemasukan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Pengeluaran */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              Kategori Pengeluaran ({expenseCategories.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">
                Belum ada kategori pengeluaran.
              </p>
            ) : (
              expenseCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="py-3 flex justify-between items-center text-xs"
                >
                  {editingId === cat.id ? (
                    <div className="flex gap-2 items-center w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-lg text-xs w-full outline-none"
                      />
                      <button
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-red-500 dark:text-red-400 hover:underline font-medium cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Pemasukan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
              Kategori Pemasukan ({incomeCategories.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {incomeCategories.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">
                Belum ada kategori pemasukan.
              </p>
            ) : (
              incomeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="py-3 flex justify-between items-center text-xs"
                >
                  {editingId === cat.id ? (
                    <div className="flex gap-2 items-center w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-lg text-xs w-full outline-none"
                      />
                      <button
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-red-500 dark:text-red-400 hover:underline font-medium cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
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