import React, { useEffect, useState } from "react";
import { ArrowLeftRight, Send, AlertCircle } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Transfer() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Transfer State
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [note, setNote] = useState("");

  // Modal Insufficient Balance
  const [insufficientModal, setInsufficientModal] = useState(false);

  // Load Daftar Dompet
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallets");
      const wList = res.data.data || res.data.wallets || [];
      setWallets(wList);

      // Set default sumber dan tujuan jika belum dipilih
      if (wList.length >= 2) {
        if (!sourceWalletId) setSourceWalletId(String(wList[0].id));
        if (!targetWalletId) setTargetWalletId(String(wList[1].id));
      } else if (wList.length === 1) {
        if (!sourceWalletId) setSourceWalletId(String(wList[0].id));
      }
    } catch (err) {
      toast.error("Gagal memuat daftar dompet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  // Format Input Nominal Transfer ke Ribuan
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmountRaw(rawValue);
    if (rawValue) {
      setAmountDisplay(parseInt(rawValue, 10).toLocaleString("id-ID"));
    } else {
      setAmountDisplay("");
    }
  };

  // Cari objek dompet sumber & tujuan aktif
  const sourceWallet = wallets.find(
    (w) => String(w.id) === String(sourceWalletId),
  );
  const targetWallet = wallets.find(
    (w) => String(w.id) === String(targetWalletId),
  );

  const sourceBalance = parseFloat(sourceWallet?.balance || 0);
  const targetBalance = parseFloat(targetWallet?.balance || 0);
  const transferNum = parseFloat(amountRaw || 0);

  // Kalkulasi Saldo Setelah Transfer secara real-time
  const finalSourceBalance = sourceBalance - transferNum;
  const finalTargetBalance = targetBalance + transferNum;

  // Tombol Swap (Tukar Sumber <-> Tujuan)
  const handleSwapWallets = () => {
    const temp = sourceWalletId;
    setSourceWalletId(targetWalletId);
    setTargetWalletId(temp);
  };

  // Handle Eksekusi Transfer
  const handleExecuteTransfer = async (e) => {
    e.preventDefault();

    if (!sourceWalletId || !targetWalletId) {
      toast.error("Pilih dompet sumber dan dompet tujuan!");
      return;
    }

    if (sourceWalletId === targetWalletId) {
      toast.error("Dompet sumber dan tujuan tidak boleh sama!");
      return;
    }

    if (!amountRaw || transferNum <= 0) {
      toast.error("Masukkan nominal transfer yang valid!");
      return;
    }

    // Validasi Saldo Cukup
    if (transferNum > sourceBalance) {
      setInsufficientModal(true);
      toast.error(`Saldo ${sourceWallet?.name || "Sumber"} tidak mencukupi!`);
      return;
    }

    // Payload dipastikan dalam format Number
    const payload = {
      source_wallet_id: Number(sourceWalletId),
      target_wallet_id: Number(targetWalletId),
      amount: Number(transferNum),
      notes: note.trim() || "Transfer antar dompet",
    };

    console.log("Payload dikirim:", payload);

    try {
      const res = await API.post("/wallets/transfer", payload);
      console.log("Respon sukses:", res.data);

      toast.success("Transfer saldo berhasil dieksekusi!");
      setAmountDisplay("");
      setAmountRaw("");
      setNote("");
      fetchWallets(); // Refresh saldo dompet terbaru
    } catch (err) {
      console.error("Detail Error Backend:", err.response?.data);
      const errMsg = err.response?.data?.error || err.response?.data?.message;
      if (errMsg && errMsg.toLowerCase().includes("mencukupi")) {
        setInsufficientModal(true);
      } else {
        toast.error(errMsg || "Gagal melakukan transfer saldo");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ArrowLeftRight
            size={24}
            className="text-blue-600 dark:text-blue-400"
          />
          Transfer Saldo Antar Dompet
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pindahkan dana secara internal tanpa memengaruhi laporan
          pemasukan/pengeluaran bulanan.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <form onSubmit={handleExecuteTransfer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* DOMPET SUMBER (ASAL) */}
            <div className="md:col-span-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block">
                Dari Dompet (Sumber)
              </label>
              <select
                value={sourceWalletId}
                onChange={(e) => setSourceWalletId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: Rp{" "}
                    {(parseFloat(w.balance) || 0).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>

              <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Saldo Tersedia
                </p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                  Rp {sourceBalance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* TOMBOL SWAP (TUKAR) */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwapWallets}
                className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center hover:bg-blue-100 transition cursor-pointer shadow-sm"
                title="Tukar Posisi Dompet"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            {/* DOMPET TUJUAN */}
            <div className="md:col-span-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block">
                Ke Dompet (Tujuan)
              </label>
              <select
                value={targetWalletId}
                onChange={(e) => setTargetWalletId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: Rp{" "}
                    {(parseFloat(w.balance) || 0).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>

              <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Saldo Setelah Transfer
                </p>
                <p
                  className={`text-sm font-black mt-0.5 ${transferNum > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                >
                  Rp {finalTargetBalance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* INPUT NOMINAL & KETERANGAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Nominal Transfer (Rp)
              </label>
              <input
                type="text"
                placeholder="Contoh: 50000"
                value={amountDisplay}
                onChange={handleAmountChange}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Catatan / Keterangan (Opsional)
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

          {/* TOMBOL EKSEKUSI */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send size={16} /> Eksekusi Transfer
            </button>
          </div>
        </form>
      </div>

      {/* MODAL SALDO TIDAK CUKUP */}
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
                Nominal transfer yang kamu masukkan melebihi sisa saldo pada
                dompet sumber{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {sourceWallet?.name}
                </span>
                .
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
    </div>
  );
}