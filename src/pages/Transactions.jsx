import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [walletId, setWalletId] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletFilter, setSelectedWalletFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Modal Hapus State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        API.get("/transactions?page=1&limit=100").catch(() => null),
        API.get("/wallets").catch(() => null),
        API.get("/categories").catch(() => null),
      ]);

      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
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
      console.error("Gagal memuat data transaksi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Kategori Sesuai Tipe di Form
  const filteredCategoriesForForm = categories.filter((c) => c.type === type);

  // Reset category state saat type berubah di form
  useEffect(() => {
    if (filteredCategoriesForForm.length > 0) {
      setCategoryId(filteredCategoriesForForm[0].id);
    } else {
      setCategoryId("");
    }
  }, [type, categories]);

  // Handle Submit Tambah Transaksi
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!walletId || !categoryId || !amount) {
      toast.error("Mohon lengkapi dompet, kategori, dan nominal!");
      return;
    }

    try {
      await API.post("/transactions", {
        wallet_id: parseInt(walletId),
        category_id: parseInt(categoryId),
        type,
        amount: parseFloat(amount),
        notes: note, // Mengirim "notes" sesuai struct Go backend
        note: note,
      });

      toast.success("Transaksi berhasil ditambahkan!");
      setAmount("");
      setNote("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah transaksi");
    }
  };

  // Handle Hapus Transaksi
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await API.delete(`/transactions/${deleteTargetId}`);
      toast.success("Transaksi berhasil dihapus");
      setDeleteTargetId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus transaksi");
    }
  };

  // Filter List Transaksi
  const filteredTransactions = transactions.filter((tx) => {
    const catObj = categories.find(
      (c) => String(c.id) === String(tx.category_id),
    );
    const catName = tx.category?.name || catObj?.name || "";
    const noteText = tx.notes || tx.note || tx.description || "";
    const searchText = `${catName} ${noteText}`.toLowerCase();

    const matchQuery = searchText.includes(searchQuery.toLowerCase());
    const matchWallet = selectedWalletFilter
      ? String(tx.wallet_id) === String(selectedWalletFilter)
      : true;
    const matchCategory = selectedCategoryFilter
      ? String(tx.category_id) === String(selectedCategoryFilter)
      : true;
    return matchQuery && matchWallet && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Receipt size={24} className="text-blue-600 dark:text-blue-400" />
          Kelola Transaksi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Catat dan pantau seluruh mutasi keuangan kamu secara rinci.
        </p>
      </div>

      {/* Form Catat Transaksi Baru */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Catat Transaksi Baru
        </h3>

        <form
          onSubmit={handleAddTransaction}
          className="grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          {/* Pilih Dompet */}
          <div className="md:col-span-1">
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
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tipe */}
          <div className="md:col-span-1">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="expense">Pengeluaran (-)</option>
              <option value="income">Pemasukan (+)</option>
            </select>
          </div>

          {/* Pilih Kategori */}
          <div className="md:col-span-1">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {filteredCategoriesForForm.length === 0 && (
                <option value="">Tidak ada kategori</option>
              )}
              {filteredCategoriesForForm.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div className="md:col-span-1">
            <input
              type="number"
              placeholder="Jumlah (Rp)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Catatan */}
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Catatan / Keterangan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tombol Submit */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={16} /> Tambah
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">
            Riwayat Transaksi
          </h3>

          {/* Toolbar Filter & Pencarian */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedWalletFilter}
              onChange={(e) => setSelectedWalletFilter(e.target.value)}
              className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Transaksi */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-10 text-center">
              Tidak ada data transaksi yang ditemukan.
            </p>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";

              // Lookup Kategori & Dompet
              const catObj = categories.find(
                (c) => String(c.id) === String(tx.category_id),
              );
              const walletObj = wallets.find(
                (w) => String(w.id) === String(tx.wallet_id),
              );

              const categoryName = tx.category?.name || catObj?.name || "Umum";
              const walletName = tx.wallet?.name || walletObj?.name || "Dompet";
              const noteText = tx.notes || tx.note || tx.description;

              // Format: Kategori > Catatan (misal: Makan > Nasgor)
              const displayTitle = noteText
                ? `${categoryName} > ${noteText}`
                : categoryName;

              const formattedDate = new Date(
                tx.created_at || tx.date,
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-gray-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div>
                      {/* Tampilkan Format Kategori > Catatan */}
                      <p className="text-xs font-bold text-gray-800 dark:text-white">
                        {displayTitle}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formattedDate} •{" "}
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          {walletName}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`text-xs font-extrabold ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"} Rp{" "}
                      {(parseFloat(tx.amount) || 0).toLocaleString("id-ID")}
                    </p>

                    <button
                      onClick={() => setDeleteTargetId(tx.id)}
                      className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
              Apakah kamu yakin ingin menghapus transaksi ini? Saldo pada dompet
              terkait akan disesuaikan kembali.
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
