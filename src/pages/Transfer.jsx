import React, { useEffect, useState } from "react";
import { 
  ArrowRightLeft, 
  Send, 
  Wallet, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Transfer() {
  const [wallets, setWallets] = useState([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await API.get("/wallets");
      if (res?.data) {
        const list = res.data.data || res.data.wallets || [];
        setWallets(list);
        if (list.length >= 2) {
          setFromWalletId(list[0].id);
          setToWalletId(list[1].id);
        } else if (list.length === 1) {
          setFromWalletId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat daftar dompet", err);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!fromWalletId || !toWalletId || !amount) {
      toast.error("Mohon pilih dompet asal, dompet tujuan, dan nominal!");
      return;
    }

    if (fromWalletId === toWalletId) {
      toast.error("Dompet asal dan tujuan tidak boleh sama!");
      return;
    }

    const sourceWallet = wallets.find((w) => String(w.id) === String(fromWalletId));
    if (sourceWallet && parseFloat(amount) > parseFloat(sourceWallet.balance)) {
      toast.error("Saldo dompet asal tidak mencukupi!");
      return;
    }

    setLoading(true);
    try {
      await API.post("/transfer", {
        from_wallet_id: parseInt(fromWalletId),
        to_wallet_id: parseInt(toWalletId),
        amount: parseFloat(amount),
        note: note || "Transfer Saldo Internal",
      });

      toast.success("Transfer saldo berhasil!");
      setAmount("");
      setNote("");
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal melakukan transfer");
    } finally {
      setLoading(false);
    }
  };

  const selectedFromWallet = wallets.find((w) => String(w.id) === String(fromWalletId));
  const selectedToWallet = wallets.find((w) => String(w.id) === String(toWalletId));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ArrowRightLeft size={24} className="text-blue-600 dark:text-blue-400" />
          Transfer Saldo Antar Dompet
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pindahkan dana secara internal tanpa mempengaruhi laporan pemasukan/pengeluaran bulanan.
        </p>
      </div>

      {/* Main Transfer Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* Selector Dompet Asal & Tujuan */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Dompet Asal */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Dari Dompet (Sumber)</label>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>

              {selectedFromWallet && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Saldo Tersedia</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">
                    Rp {(parseFloat(selectedFromWallet.balance) || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>

            {/* Indicator Icon */}
            <div className="md:col-span-1 flex items-center justify-center pt-2 md:pt-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <ArrowRightLeft size={18} />
              </div>
            </div>

            {/* Dompet Tujuan */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Ke Dompet (Tujuan)</label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>

              {selectedToWallet && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Saldo Setelah Transfer</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Rp {(
                      (parseFloat(selectedToWallet.balance) || 0) + (parseFloat(amount) || 0)
                    ).toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Form Nominal & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Nominal Transfer (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Top up e-wallet / Pindah Tabungan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || wallets.length < 2}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={16} />
            <span>{loading ? "Memproses Transfer..." : "Eksekusi Transfer"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}