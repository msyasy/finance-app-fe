import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [editingWallet, setEditingWallet] = useState(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch Wallets dari Backend
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallets");
      const data = res.data?.data || res.data?.wallets || (Array.isArray(res.data) ? res.data : []);
      setWallets(data);
    } catch (err) {
      console.error("Gagal memuat dompet:", err);
      toast.error("Gagal memuat data dompet dari server");
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  // Format Input Angka Rupiah
  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  // Tambah / Update Dompet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama dompet tidak boleh kosong");

    const cleanBalance = parseFloat(balance.replace(/\./g, "")) || 0;

    try {
      if (editingWallet) {
        // Update Dompet
        await API.put(`/wallets/${editingWallet.id}`, {
          name,
          balance: cleanBalance,
        });
        toast.success("Dompet berhasil diperbarui!");
      } else {
        // Buat Dompet Baru
        await API.post("/wallets", {
          name,
          balance: cleanBalance,
        });
        toast.success("Dompet baru berhasil ditambahkan!");
      }

      setName("");
      setBalance("");
      setEditingWallet(null);
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan dompet");
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    setBalance(new Intl.NumberFormat("id-ID").format(wallet.balance));
  };

  const handleDelete = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Dompet",
      message: "Yakin ingin menghapus dompet ini? Seluruh riwayat mutasi terkait mungkin akan terpengaruh.",
      onConfirm: async () => {
        try {
          await API.delete(`/wallets/${id}`);
          toast.success("Dompet berhasil dihapus");
          fetchWallets();
        } catch {
          toast.error("Gagal menghapus dompet");
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kelola Dompet Saya
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Atur rekening bank, e-wallet, atau kas tunai kamu di sini
        </p>
      </div>

      {/* Form Tambah/Edit Dompet */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          {editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nama Dompet (Contoh: BCA, Dana, Cash)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Saldo Awal (Rp)"
            required
            value={balance}
            onChange={(e) => setBalance(formatAmountInput(e.target.value))}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-2.5 text-xs transition cursor-pointer"
            >
              {editingWallet ? "Simpan Perubahan" : "Tambah Dompet"}
            </button>
            {editingWallet && (
              <button
                type="button"
                onClick={() => {
                  setEditingWallet(null);
                  setName("");
                  setBalance("");
                }}
                className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-4 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Daftar Dompet */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Daftar Rekening & Dompet
        </h3>

        {loading ? (
          <p className="text-gray-400 text-center py-8 text-xs">Memuat dompet...</p>
        ) : wallets.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-xs">Belum ada dompet terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-col justify-between space-y-4"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Dompet Aktif
                  </p>
                  <h4 className="text-base font-black text-gray-900 dark:text-white mt-1">
                    {w.name}
                  </h4>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    Rp {parseFloat(w.balance || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => handleEdit(w)}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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