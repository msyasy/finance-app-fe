import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function TransferModal({ isOpen, onClose, wallets, onSuccess }) {
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [destWalletId, setDestWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!sourceWalletId || !destWalletId) {
      toast.error("Pilih dompet asal dan tujuan");
      return;
    }

    if (sourceWalletId === destWalletId) {
      toast.error("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    const cleanAmount = parseFloat(amount.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      toast.error("Masukkan nominal transfer yang valid");
      return;
    }

    setLoading(true);
    try {
      await API.post("/wallets/transfer", {
        source_wallet_id: parseInt(sourceWalletId),
        destination_wallet_id: parseInt(destWalletId),
        amount: cleanAmount,
      });

      toast.success("Transfer saldo berhasil!");
      setAmount("");
      setSourceWalletId("");
      setDestWalletId("");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal melakukan transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-800">
            Transfer Antar Dompet
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleTransfer} className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Dompet Asal (Sumber Dana)
            </label>
            <select
              value={sourceWalletId}
              onChange={(e) => setSourceWalletId(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">-- Pilih Dompet Asal --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Rp {parseFloat(w.balance).toLocaleString("id-ID")})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Dompet Tujuan
            </label>
            <select
              value={destWalletId}
              onChange={(e) => setDestWalletId(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">-- Pilih Dompet Tujuan --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Nominal Transfer
            </label>
            <input
              type="text"
              placeholder="Jumlah (Rp)"
              required
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Memproses..." : "Transfer Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
