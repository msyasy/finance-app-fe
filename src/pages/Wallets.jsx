import React, { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  Coins,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Tambah State dengan Format Ribuan (Saldo Opsional)
  const [name, setName] = useState("");
  const [balanceDisplay, setBalanceDisplay] = useState("");
  const [balanceRaw, setBalanceRaw] = useState("");

  // Modal Hapus State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallets").catch(() => null);
      if (res?.data) {
        setWallets(res.data.data || res.data.wallets || []);
      }
    } catch (err) {
      console.error("Gagal memuat daftar dompet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  // Helper Format Input Saldo Awal ke Ribuan
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setBalanceRaw(rawValue);
    if (rawValue) {
      setBalanceDisplay(parseInt(rawValue, 10).toLocaleString("id-ID"));
    } else {
      setBalanceDisplay("");
    }
  };

  // Tambah Dompet Baru (Saldo Opsional)
  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama dompet wajib diisi!");
      return;
    }

    try {
      await API.post("/wallets", {
        name,
        balance: balanceRaw ? parseFloat(balanceRaw) : 0, // Jika kosong otomatis jadi 0
      });

      toast.success("Dompet berhasil ditambahkan!");
      setName("");
      setBalanceDisplay("");
      setBalanceRaw("");
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah dompet");
    }
  };

  // Konfirmasi Hapus Dompet
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await API.delete(`/wallets/${deleteTargetId}`);
      toast.success("Dompet berhasil dihapus");
      setDeleteTargetId(null);
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus dompet");
    }
  };

  const totalBalance = wallets.reduce(
    (acc, curr) => acc + (parseFloat(curr.balance) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wallet size={24} className="text-blue-600 dark:text-blue-400" />
            Kelola Dompet Saya
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Atur rekening bank, e-wallet, dan sumber dana tunai kamu di satu
            tempat.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 px-4 py-2.5 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Total Semua Saldo
          </p>
          <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
            Rp {totalBalance.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Form Tambah Dompet */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tambah Akun / Dompet Baru
        </h3>

        <form
          onSubmit={handleAddWallet}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div>
            <input
              type="text"
              placeholder="Nama Dompet (contoh: BCA / SeaBank / Cash)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Saldo Awal (Opsional, default 0)"
              value={balanceDisplay}
              onChange={handleAmountChange}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={16} /> Tambah Dompet
            </button>
          </div>
        </form>
      </div>

      {/* Grid List Dompet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-10 rounded-2xl text-center">
            <Coins size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-400">
              Belum ada dompet terdaftar. Tambahkan dompet pertama kamu di atas!
            </p>
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-gray-200 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase">
                      {w.name}
                    </h4>
                    <p className="text-[10px] text-gray-400">Akun Keuangan</p>
                  </div>
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => setDeleteTargetId(w.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                  title="Hapus Dompet"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Sisa Saldo
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                  Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        )}
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
              Apakah kamu yakin ingin menghapus dompet ini? Riwayat transaksi
              terkait dompet ini bisa ikut terpengaruh.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
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
