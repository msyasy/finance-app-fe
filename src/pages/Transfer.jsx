import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Transfer() {
  const [wallets, setWallets] = useState([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await API.get("/wallets");
      const fetchedWallets = res.data.data || [];
      setWallets(fetchedWallets);

      if (fetchedWallets.length >= 2) {
        setFromWalletId((prev) => (prev ? prev : fetchedWallets[0].id));
        setToWalletId((prev) => (prev ? prev : fetchedWallets[1].id));
      } else if (fetchedWallets.length === 1) {
        setFromWalletId(fetchedWallets[0].id);
      }
    } catch {
      toast.error("Gagal memuat daftar dompet");
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

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const sourceWallet = wallets.find((w) => w.id === Number(fromWalletId));
  const targetWallet = wallets.find((w) => w.id === Number(toWalletId));

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!fromWalletId || !toWalletId) {
      return toast.error("Silakan pilih dompet asal dan tujuan");
    }

    if (fromWalletId === toWalletId) {
      return toast.error("Dompet asal dan tujuan tidak boleh sama");
    }

    const cleanAmount = parseFloat(amount.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return toast.error("Masukkan nominal transfer yang valid");
    }

    if (sourceWallet && cleanAmount > parseFloat(sourceWallet.balance)) {
      return toast.error("Saldo dompet asal tidak mencukupi");
    }

    setLoading(true);

    try {
      await API.post("/wallets/transfer", {
        from_wallet_id: parseInt(fromWalletId),
        to_wallet_id: parseInt(toWalletId),
        amount: cleanAmount,
        notes: notes || "Transfer Antar Dompet",
      });

      toast.success("Transfer saldo berhasil!");
      setAmount("");
      setNotes("");
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal melakukan transfer saldo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Transfer Saldo
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pindahkan dana dengan mudah antar rekening, e-wallet, atau kas tunai kamu
        </p>
      </div>

      {/* Peringatan Jika Dompet Kurang dari 2 */}
      {wallets.length < 2 ? (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl text-center space-y-3">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Kamu butuh minimal <strong>2 dompet aktif</strong> untuk melakukan transfer antar dompet.
          </p>
          <Link
            to="/wallets"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            + Buat Dompet Baru Sekarang
          </Link>
        </div>
      ) : (
        /* Form Transfer Saldo */
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-6">
          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Pemilihan Dompet Asal vs Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Dompet Asal */}
              <div className="md:col-span-2 space-y-2 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Dari Dompet (Sumber)
                </label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {sourceWallet && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium pt-1">
                    Saldo Tersedia:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatRupiah(sourceWallet.balance)}
                    </strong>
                  </p>
                )}
              </div>

              {/* Panah / Indikator Transfer */}
              <div className="flex justify-center items-center">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold rounded-full flex items-center justify-center text-lg shadow-sm">
                  ➔
                </div>
              </div>

              {/* Dompet Tujuan */}
              <div className="md:col-span-2 space-y-2 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Ke Dompet (Tujuan)
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === Number(fromWalletId)}>
                      {w.name} {w.id === Number(fromWalletId) ? "(Dompet Asal)" : ""}
                    </option>
                  ))}
                </select>
                {targetWallet && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium pt-1">
                    Saldo Saat Ini:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatRupiah(targetWallet.balance)}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            {/* Input Nominal & Catatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nominal Transfer (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                  className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Topup SeaBank dari BCA"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-3.5 text-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Memproses Transfer..." : "🔄 Eksekusi Transfer Saldo"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}