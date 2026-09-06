import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [newWalletName, setNewWalletName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchWallets = async () => {
    try {
      const res = await API.get("/wallets");
      setWallets(res.data.data || []);
    } catch {
      toast.error("Gagal memuat data dompet");
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    const cleanBalance = parseFloat(initialBalance.replace(/\./g, "")) || 0;

    try {
      await API.post("/wallets", {
        name: newWalletName,
        balance: cleanBalance,
      });
      toast.success("Dompet berhasil ditambahkan!");
      setNewWalletName("");
      setInitialBalance("");
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membuat dompet");
    }
  };

  const handleDeleteWallet = (id, name) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Dompet",
      message: `Yakin ingin menghapus dompet "${name}"? Semua transaksi di dalamnya juga akan terpengaruh.`,
      onConfirm: async () => {
        try {
          await API.delete(`/wallets/${id}`);
          toast.success("Dompet berhasil dihapus");
          fetchWallets();
        } catch (err) {
          toast.error(err.response?.data?.error || "Gagal menghapus dompet");
        }
      },
    });
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const totalBalance = wallets.reduce(
    (acc, w) => acc + parseFloat(w.balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header & Total Saldo Ringkasan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dompet Saya
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Kelola semua akun rekening, e-wallet, dan kas tunai kamu
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 px-5 py-3 rounded-xl">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Total Seluruh Saldo
          </span>
          <span className="text-xl font-black text-blue-700 dark:text-blue-300">
            {formatRupiah(totalBalance)}
          </span>
        </div>
      </div>

      {/* Form Tambah Dompet */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tambah Dompet Baru
        </h3>
        <form onSubmit={handleCreateWallet} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nama Dompet (contoh: BCA / SeaBank / Cash)"
            required
            value={newWalletName}
            onChange={(e) => setNewWalletName(e.target.value)}
            className="p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Saldo Awal (Rp)"
            value={initialBalance}
            onChange={(e) => setInitialBalance(formatAmountInput(e.target.value))}
            className="p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl p-3 text-xs transition cursor-pointer"
          >
            + Simpan Dompet
          </button>
        </form>
      </div>

      {/* Grid Daftar Dompet */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Daftar Dompet Aktif ({wallets.length})
        </h3>
        {wallets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 text-center text-gray-400 dark:text-gray-500 text-sm italic">
            Belum ada dompet. Silakan buat dompet pertama kamu di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center transition-colors hover:border-gray-200 dark:hover:border-slate-700"
              >
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {w.name}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {formatRupiah(w.balance)}
                  </h4>
                </div>
                <button
                  onClick={() => handleDeleteWallet(w.id, w.name)}
                  className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer text-xs font-semibold"
                  title="Hapus Dompet"
                >
                  Hapus
                </button>
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