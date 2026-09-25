import React, { useState, useEffect } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function FloatingAddTxModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [walletId, setWalletId] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [note, setNote] = useState("");

  // Balance modal
  const [insufficientModal, setInsufficientModal] = useState(false);
  const [selectedWalletInfo, setSelectedWalletInfo] = useState({
    name: "",
    balance: 0,
  });

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const [walletRes, catRes] = await Promise.all([
        API.get("/wallets").catch(() => null),
        API.get("/categories").catch(() => null),
      ]);

      if (walletRes?.data) {
        const wList = walletRes.data.data || walletRes.data.wallets || [];
        setWallets(wList);
        if (wList.length > 0 && !walletId) setWalletId(wList[0].id);
      }
      if (catRes?.data) {
        const cList = catRes.data.data || catRes.data.categories || [];
        setCategories(cList);
      }
    } catch (err) {
      console.error("Gagal memuat meta data transaksi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    } else {
      setCategoryId("");
    }
  }, [type, categories]);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmountRaw(rawValue);
    if (rawValue) {
      setAmountDisplay(parseInt(rawValue, 10).toLocaleString("id-ID"));
    } else {
      setAmountDisplay("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletId || !categoryId || !amountRaw) {
      toast.error("Mohon lengkapi dompet, kategori, dan nominal!");
      return;
    }

    const inputAmount = parseFloat(amountRaw);
    const targetWallet = wallets.find((w) => String(w.id) === String(walletId));

    if (type === "expense" && targetWallet) {
      const currentBal = parseFloat(targetWallet.balance) || 0;
      if (inputAmount > currentBal) {
        setSelectedWalletInfo({
          name: targetWallet.name,
          balance: currentBal,
        });
        setInsufficientModal(true);
        toast.error(`Saldo ${targetWallet.name} tidak mencukupi!`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await API.post("/transactions", {
        wallet_id: parseInt(walletId),
        category_id: parseInt(categoryId),
        type,
        amount: inputAmount,
        notes: note,
        note: note,
      });

      toast.success("Transaksi berhasil dicatat!");
      setAmountDisplay("");
      setAmountRaw("");
      setNote("");
      setIsOpen(false);

      // Trigger custom global event agar semua komponen/page merefresh data
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (msg && msg.toLowerCase().includes("mencukupi")) {
        setInsufficientModal(true);
      } else {
        toast.error(msg || "Gagal mencatat transaksi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button Melayang */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-600/30 rounded-full px-4 py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
        title="Catat Transaksi Baru"
      >
        <Plus
          size={20}
          className="group-hover:rotate-90 transition-transform duration-200"
        />
        <span className="text-xs font-bold hidden sm:inline">
          Catat Transaksi
        </span>
      </button>

      {/* Modal Overlay Catat Transaksi */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-blue-600 dark:text-blue-400" />
                Catat Transaksi Baru
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipe Transaksi */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    type === "expense"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                      : "bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  Pengeluaran (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    type === "income"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                      : "bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  Pemasukan (+)
                </button>
              </div>

              {/* Pilih Dompet */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Pilih Dompet / Rekening
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {wallets.length === 0 && (
                    <option value="">Belum Ada Dompet</option>
                  )}
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp{" "}
                      {parseFloat(w.balance || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Kategori */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {filteredCategories.length === 0 && (
                    <option value="">Tidak ada kategori</option>
                  )}
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nominal Jumlah */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Catatan */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang, Gaji bulanan, dll."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alert Saldo Tidak Mencukupi */}
      {insufficientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Saldo Tidak Mencukupi!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Nominal transaksi yang kamu masukkan melebihi sisa saldo pada
                dompet{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {selectedWalletInfo.name}
                </span>{" "}
                (Sisa Saldo:{" "}
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Rp {selectedWalletInfo.balance.toLocaleString("id-ID")}
                </span>
                ).
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setInsufficientModal(false)}
                className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
