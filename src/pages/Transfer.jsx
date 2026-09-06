import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Transfer() {
  const [wallets, setWallets] = useState([]);
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch daftar dompet
  const fetchWallets = async () => {
    try {
      const res = await API.get("/wallets");
      const data =
        res.data?.data ||
        res.data?.wallets ||
        (Array.isArray(res.data) ? res.data : []);
      setWallets(data);
      if (data.length >= 2) {
        setSourceWalletId(data[0].id);
        setTargetWalletId(data[1].id);
      }
    } catch (err) {
      console.error("Gagal memuat dompet:", err);
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

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!sourceWalletId || !targetWalletId) {
      return toast.error("Pilih dompet sumber dan tujuan terlebih dahulu");
    }
    if (sourceWalletId === targetWalletId) {
      return toast.error("Dompet sumber dan tujuan tidak boleh sama");
    }

    const cleanAmount = parseFloat(amount.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return toast.error("Masukkan nominal transfer yang valid");
    }

    setLoading(true);
    try {
      // Endpoint transfer saldo antar dompet (menyesuaikan rute backend Go)
      await API.post("/transfers", {
        source_wallet_id: parseInt(sourceWalletId),
        target_wallet_id: parseInt(targetWalletId),
        amount: cleanAmount,
        notes: notes || "Transfer antar dompet",
      });

      toast.success("Transfer saldo berhasil dilakukan!");
      setAmount("");
      setNotes("");
      fetchWallets();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal melakukan transfer saldo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Transfer Saldo Antar Dompet
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pindahkan saldo antar rekening atau dompet kamu dengan mudah
        </p>
      </div>

      {/* Form Transfer */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dompet Asal */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Dari Dompet (Sumber)
              </label>
              <select
                value={sourceWalletId}
                onChange={(e) => setSourceWalletId(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {wallets.length === 0 ? (
                  <option value="">Belum ada dompet</option>
                ) : (
                  wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp {parseFloat(w.balance || 0).toLocaleString("id-ID")})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Dompet Tujuan */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Ke Dompet (Tujuan)
              </label>
              <select
                value={targetWalletId}
                onChange={(e) => setTargetWalletId(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                {wallets.length === 0 ? (
                  <option value="">Belum ada dompet</option>
                ) : (
                  wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp {parseFloat(w.balance || 0).toLocaleString("id-ID")})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Nominal Transfer */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Jumlah Nominal (Rp)
            </label>
            <input
              type="text"
              placeholder="0"
              required
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Catatan */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Tarik tunai ATM / Isi e-wallet"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-2.5 text-xs transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Memproses Transfer..." : "Transfer Saldo Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}