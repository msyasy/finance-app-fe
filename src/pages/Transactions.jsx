import React, { useEffect, useState } from "react";
import {
  Receipt,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

// Helper parsing tanggal yang aman dari format PostgreSQL (potong mikrodetik)
function parseDateSafe(rawDate) {
  if (!rawDate) return null;
  let str = String(rawDate).trim();
  if (str.includes(".")) {
    str = str.split(".")[0];
  }
  str = str.replace(" ", "T");
  let d = new Date(str);
  if (isNaN(d.getTime())) {
    const datePart = String(rawDate).split(" ")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      d = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    }
  }
  return isNaN(d.getTime()) ? null : d;
}

function formatTxDate(rawDate) {
  const d = parseDateSafe(rawDate);
  if (!d) return "Baru saja";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Client-Side Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletFilter, setSelectedWalletFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Modal State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Load Seluruh Data (Limit Besar untuk Client-Side Filter)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        API.get("/transactions?page=1&limit=1000").catch(() => null),
        API.get("/wallets").catch(() => null),
        API.get("/categories").catch(() => null),
      ]);

      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
      if (walletRes?.data) {
        setWallets(walletRes.data.data || walletRes.data.wallets || []);
      }
      if (catRes?.data) {
        setCategories(catRes.data.data || catRes.data.categories || []);
      }
    } catch (err) {
      console.error("Gagal memuat data transaksi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen event global dari Floating Button saat transaksi baru ditambahkan
    const handleTxUpdate = () => {
      fetchData();
    };
    window.addEventListener("transactionUpdated", handleTxUpdate);
    return () => {
      window.removeEventListener("transactionUpdated", handleTxUpdate);
    };
  }, []);

  // Handle Reset Halaman ke-1 Saat Filter Berubah
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedWalletFilter, selectedCategoryFilter]);

  // Handle Hapus Transaksi
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await API.delete(`/transactions/${deleteTargetId}`);
      toast.success("Transaksi berhasil dihapus");
      setDeleteTargetId(null);
      fetchData();
      // Dispatch global event agar dompet/dashboard juga terupdate
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus transaksi");
    }
  };

  // 1. Filter Seluruh Transaksi berdasarkan Kriteria
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

  // 2. Client-side Pagination dari Data Terfilter
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Receipt size={24} className="text-blue-600 dark:text-blue-400" />
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pantau seluruh mutasi keuangan dan histori transaksi kamu secara
          rinci.
        </p>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">
            Daftar Transaksi ({totalItems})
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
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Memuat riwayat transaksi...
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-10 text-center">
              Tidak ada data transaksi yang ditemukan.
            </p>
          ) : (
            paginatedTransactions.map((tx) => {
              const isIncome = tx.type === "income";

              const catObj = categories.find(
                (c) => String(c.id) === String(tx.category_id),
              );
              const walletObj = wallets.find(
                (w) => String(w.id) === String(tx.wallet_id),
              );

              const categoryName = tx.category?.name || catObj?.name || "Umum";
              const walletName = tx.wallet?.name || walletObj?.name || "Dompet";
              const noteText = tx.notes || tx.note || tx.description;

              const displayTitle = noteText
                ? `${categoryName} > ${noteText}`
                : categoryName;

              const formattedDate = formatTxDate(tx.created_at || tx.date);

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

        {/* Control Pagination */}
        {totalItems > itemsPerPage && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Halaman{" "}
              <span className="font-bold text-gray-800 dark:text-white">
                {page}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-800 dark:text-white">
                {totalPages}
              </span>{" "}
              (Total {totalItems} transaksi)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
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
