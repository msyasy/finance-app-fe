import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);

  // State Form Tambah Transaksi
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletFilter, setSelectedWalletFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Options Tahun Dinamis
  const startYear = 2026;
  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: Math.max(currentYearNum - startYear + 2, 1) },
    (_, index) => startYear + index
  );

  // Pagination State
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchData = async () => {
    // 1. Fetch Wallets & Categories
    try {
      const [walletRes, catRes] = await Promise.all([
        API.get("/wallets"),
        API.get("/categories"),
      ]);
      const fetchedWallets = walletRes.data.data || [];
      const fetchedCategories = catRes.data.data || [];

      setWallets(fetchedWallets);
      setCategories(fetchedCategories);

      if (fetchedWallets.length > 0 && !walletId) {
        setWalletId(fetchedWallets[0].id);
      }
      if (fetchedCategories.length > 0 && !categoryId) {
        const defaultCat = fetchedCategories.find((c) => c.type === type);
        if (defaultCat) setCategoryId(defaultCat.id);
      }
    } catch (err) {
      console.error("Gagal memuat master data", err);
    }

    // 2. Fetch Transactions
    try {
      let url = `/transactions?page=${page}&limit=10`;
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      } else if (selectedMonth && selectedYear) {
        const start = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const end = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${lastDay}`;
        url += `&start_date=${start}&end_date=${end}`;
      }

      const txRes = await API.get(url);
      setTransactions(txRes.data.data || []);
      if (txRes.data.pagination) {
        setPaginationMeta({
          currentPage: txRes.data.pagination.current_page || 1,
          limit: txRes.data.pagination.limit || 10,
          totalItems: txRes.data.pagination.total_items || 0,
          totalPages: txRes.data.pagination.total_pages || 1,
        });
      }
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, startDate, endDate, selectedMonth, selectedYear]);

  // Formatter & Handlers
  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    const availableCats = categories.filter((c) => c.type === newType);
    if (availableCats.length > 0) {
      setCategoryId(availableCats[0].id);
    } else {
      setCategoryId("");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!walletId) return toast.error("Pilih dompet terlebih dahulu");
    if (!categoryId) return toast.error("Pilih kategori terlebih dahulu");

    const cleanAmount = parseFloat(amount.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return toast.error("Masukkan nominal yang valid");
    }

    try {
      await API.post("/transactions", {
        wallet_id: parseInt(walletId),
        category_id: parseInt(categoryId),
        type,
        amount: cleanAmount,
        notes,
      });
      toast.success("Transaksi berhasil dicatat!");
      setAmount("");
      setNotes("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal mencatat transaksi");
    }
  };

  const handleDeleteTransaction = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Transaksi",
      message: "Yakin ingin menghapus transaksi ini?",
      onConfirm: async () => {
        try {
          await API.delete(`/transactions/${id}`);
          toast.success("Transaksi berhasil dihapus");
          fetchData();
        } catch {
          toast.error("Gagal menghapus transaksi");
        }
      },
    });
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const filteredTransactions = transactions.filter((t) => {
    const categoryName =
      t.category?.name || categories.find((c) => c.id === t.category_id)?.name || "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      (t.notes && t.notes.toLowerCase().includes(searchLower)) ||
      categoryName.toLowerCase().includes(searchLower);

    const matchesWallet =
      selectedWalletFilter === "all" || t.wallet_id === Number(selectedWalletFilter);

    const matchesCategory =
      selectedCategoryFilter === "all" || t.category_id === Number(selectedCategoryFilter);

    return matchesSearch && matchesWallet && matchesCategory;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman (Tanpa Tombol Toggle Batal/Tambah lagi) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kelola Transaksi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Pencatatan dan riwayat mutasi dana kamu
        </p>
      </div>

      {/* Form Tambah Transaksi (Langsung Tampil Permanent) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Form Transaksi Baru
        </h3>
        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            {wallets.length === 0 ? (
              <option value="">Buat dompet dulu</option>
            ) : (
              wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))
            )}
          </select>

          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="expense">Pengeluaran (-)</option>
            <option value="income">Pemasukan (+)</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            {filteredCategories.length === 0 ? (
              <option value="">Tambah kategori dulu</option>
            ) : (
              filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>

          <input
            type="text"
            placeholder="Jumlah (Rp)"
            required
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(e.target.value))}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="Catatan / Keterangan"
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl p-2.5 text-xs transition cursor-pointer"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>

      {/* Tabel & Filter Transaksi */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <select
              value={selectedWalletFilter}
              onChange={(e) => setSelectedWalletFilter(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setPage(1);
              }}
              disabled={Boolean(startDate && endDate)}
              className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              <option value={1}>Januari</option>
              <option value={2}>Februari</option>
              <option value={3}>Maret</option>
              <option value={4}>April</option>
              <option value={5}>Mei</option>
              <option value={6}>Juni</option>
              <option value={7}>Juli</option>
              <option value={8}>Agustus</option>
              <option value={9}>September</option>
              <option value={10}>Oktober</option>
              <option value={11}>November</option>
              <option value={12}>Desember</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setPage(1);
              }}
              disabled={Boolean(startDate && endDate)}
              className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <span className="text-gray-300 dark:text-slate-700">|</span>

            <span className="text-gray-400 dark:text-gray-500 font-medium">Manual:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-gray-400 dark:text-gray-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="text-red-500 dark:text-red-400 hover:text-red-700 font-medium text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 transition cursor-pointer"
              >
                Reset Tanggal
              </button>
            )}
          </div>
        </div>

        {/* List Mutasi */}
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-10 text-sm">
              Tidak ada data transaksi ditemukan.
            </p>
          ) : (
            filteredTransactions.map((t) => {
              const isIncome = t.type === "income";
              const walletName =
                t.wallet?.name ||
                wallets.find((w) => w.id === t.wallet_id)?.name ||
                "Dompet";
              const categoryName =
                t.category?.name ||
                categories.find((c) => c.id === t.category_id)?.name;

              return (
                <div key={t.id} className="py-3.5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      {t.notes} {categoryName ? `• ${categoryName}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatDate(t.created_at || t.date)} •{" "}
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {walletName}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-bold text-sm ${
                        isIncome
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"} Rp{" "}
                      {parseFloat(t.amount).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 text-xs font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {paginationMeta.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              &larr; Prev
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Halaman {paginationMeta.currentPage} dari {paginationMeta.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, paginationMeta.totalPages))
              }
              disabled={page >= paginationMeta.totalPages}
              className="px-3.5 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              Next &rarr;
            </button>
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