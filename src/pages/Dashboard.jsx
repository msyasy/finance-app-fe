import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import TransferModal from "../components/TransferModal";

const CHART_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#D97706",
  "#9333EA",
  "#0891B2",
  "#E11D48",
];

export default function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [newWalletName, setNewWalletName] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletFilter, setSelectedWalletFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Berhasil logout");
    navigate("/login");
  };

  const fetchData = async () => {
    try {
      const walletRes = await API.get("/wallets");
      const fetchedWallets = walletRes.data.data || [];
      setWallets(fetchedWallets);
      if (fetchedWallets.length > 0) {
        setWalletId((prev) => (prev ? prev : fetchedWallets[0].id));
      } else {
        setWalletId("");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      setWallets([]);
    }

    try {
      const txRes = await API.get(`/transactions?page=${page}&limit=10`);
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

    try {
      const catRes = await API.get("/categories");
      const fetchedCategories = catRes.data.data || [];
      setCategories(fetchedCategories);
      const defaultCat = fetchedCategories.find((c) => c.type === type);
      if (defaultCat) setCategoryId((prev) => (prev ? prev : defaultCat.id));
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const availableCats = categories.filter((c) => c.type === newType);
    if (availableCats.length > 0) {
      setCategoryId(availableCats[0].id);
    } else {
      setCategoryId("");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post("/categories", {
        name: newCategoryName,
        type: newCategoryType,
      });
      toast.success("Kategori berhasil dibuat!");
      setNewCategoryName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membuat kategori");
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      await API.post("/wallets", {
        name: newWalletName,
        balance: 0,
      });
      toast.success("Dompet berhasil dibuat!");
      setNewWalletName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membuat dompet");
    }
  };

  const handleDeleteWallet = (id, name) => {
    setModalConfig({
      isOpen: true,
      title: "Hapus Dompet",
      message: `Yakin ingin menghapus dompet "${name}"? Semua transaksi di dalamnya juga akan terhapus.`,
      onConfirm: async () => {
        try {
          await API.delete(`/wallets/${id}`);
          toast.success("Dompet berhasil dihapus");
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || "Gagal menghapus dompet");
        }
      },
    });
  };

  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!walletId) {
      toast.error("Silakan buat dan pilih dompet terlebih dahulu");
      return;
    }
    if (!categoryId) {
      toast.error("Silakan buat dan pilih kategori terlebih dahulu");
      return;
    }

    const cleanAmount = parseFloat(amount.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      toast.error("Masukkan nominal yang valid");
      return;
    }

    try {
      await API.post("/transactions", {
        wallet_id: parseInt(walletId),
        category_id: parseInt(categoryId),
        type: type,
        amount: cleanAmount,
        notes: notes,
      });
      toast.success("Transaksi berhasil dicatat!");
      setAmount("");
      setNotes("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menambahkan transaksi");
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
          toast.success("Transaksi dihapus");
          fetchData();
        } catch {
          toast.error("Gagal menghapus transaksi");
        }
      },
    });
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const totalBalance = wallets.reduce(
    (acc, wallet) => acc + parseFloat(wallet.balance || 0),
    0,
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const transDate = new Date(t.created_at || Date.now());
    return (
      transDate.getMonth() === currentMonth &&
      transDate.getFullYear() === currentYear
    );
  });

  const totalIncome = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const totalExpense = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const chartDataMap = {};
  thisMonthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const catName =
        categories.find((c) => c.id === t.category_id)?.name || "Lainnya";
      chartDataMap[catName] =
        (chartDataMap[catName] || 0) + parseFloat(t.amount);
    });

  const chartData = Object.keys(chartDataMap).map((key) => ({
    name: key,
    value: chartDataMap[key],
  }));

  const filteredTransactions = transactions.filter((t) => {
    const categoryName =
      t.category?.name ||
      categories.find((c) => c.id === t.category_id)?.name ||
      "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      (t.notes && t.notes.toLowerCase().includes(searchLower)) ||
      categoryName.toLowerCase().includes(searchLower);

    const matchesWallet =
      selectedWalletFilter === "all" ||
      t.wallet_id === Number(selectedWalletFilter);

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      t.category_id === Number(selectedCategoryFilter);

    return matchesSearch && matchesWallet && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Keuangan
            </h1>
            <p className="text-sm text-gray-500">
              Kelola dompet, kategori, dan transaksi kamu
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Saldo Utama
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {formatRupiah(totalBalance)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              Rp
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Pemasukan (Bulan Ini)
              </p>
              <h3 className="text-xl font-bold text-green-600 mt-1">
                + {formatRupiah(totalIncome)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
              ↑
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Pengeluaran (Bulan Ini)
              </p>
              <h3 className="text-xl font-bold text-red-600 mt-1">
                - {formatRupiah(totalExpense)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
              ↓
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Daftar Dompet</h3>
              {wallets.length >= 2 && (
                <button
                  onClick={() => setIsTransferOpen(true)}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  ⇄ Transfer Saldo
                </button>
              )}
            </div>

            <form onSubmit={handleCreateWallet} className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Dompet (contoh: BCA / Cash)"
                required
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition cursor-pointer"
              >
                + Dompet
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {wallets.length === 0 ? (
                <p className="text-gray-400 text-sm italic col-span-2">
                  Belum ada dompet.
                </p>
              ) : (
                wallets.map((w) => (
                  <div
                    key={w.id}
                    className="bg-slate-900 text-white p-3 rounded-xl shadow-sm flex justify-between items-center group hover:bg-slate-800 transition border border-slate-800"
                  >
                    <div className="truncate pr-2">
                      <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider truncate">
                        {w.name}
                      </p>
                      <h2 className="text-sm font-bold mt-0.5 truncate">
                        Rp {parseFloat(w.balance).toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleDeleteWallet(w.id, w.name)}
                      className="text-slate-400 hover:text-red-400 p-1 transition cursor-pointer rounded-lg hover:bg-slate-700/50"
                      title="Hapus Dompet"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              Tambah Kategori Baru
            </h3>
            <form
              onSubmit={handleCreateCategory}
              className="flex flex-col gap-3"
            >
              <select
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white font-semibold"
              >
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Kategori (contoh: Investasi)"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition cursor-pointer"
                >
                  + Kategori
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Catat Transaksi Baru
          </h3>
          <form
            onSubmit={handleAddTransaction}
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
          >
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
            >
              <option value="expense">Pengeluaran (-)</option>
              <option value="income">Pemasukan (+)</option>
            </select>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Catatan"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-2.5 text-sm transition cursor-pointer"
            >
              + Tambah
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              Riwayat Transaksi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <select
                value={selectedWalletFilter}
                onChange={(e) => setSelectedWalletFilter(e.target.value)}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                className="p-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <p className="text-gray-400 text-center py-6 text-sm">
                  {transactions.length === 0
                    ? "Belum ada transaksi."
                    : "Tidak ada data yang cocok."}
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
                    <div
                      key={t.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {t.notes} {categoryName ? `• ${categoryName}` : ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(t.created_at || t.date)} •{" "}
                          <span className="font-medium text-gray-500">
                            {walletName}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-sm ${
                            isIncome ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"} Rp{" "}
                          {parseFloat(t.amount).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {paginationMeta.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                >
                  &larr; Prev
                </button>
                <span className="text-xs text-gray-400 font-medium">
                  {paginationMeta.currentPage} / {paginationMeta.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, paginationMeta.totalPages),
                    )
                  }
                  disabled={page >= paginationMeta.totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Pengeluaran Bulan Ini
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Analisis alokasi dana
                  </p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                  -{formatRupiah(totalExpense)}
                </span>
              </div>

              {chartData.length > 0 &&
                (() => {
                  const topCategory = [...chartData].sort(
                    (a, b) => b.value - a.value,
                  )[0];
                  const percentage =
                    totalExpense > 0
                      ? ((topCategory.value / totalExpense) * 100).toFixed(0)
                      : 0;
                  return (
                    <div className="bg-slate-50 p-3 rounded-xl mb-2 border border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">
                        Pengeluaran Terbesar:
                      </span>
                      <span className="font-bold text-slate-800">
                        {topCategory.name} ({percentage}%)
                      </span>
                    </div>
                  );
                })()}
            </div>

            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic py-10">
                Belum ada pengeluaran bulan ini.
              </div>
            ) : (
              <div className="w-full h-64 my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `Rp ${val.toLocaleString("id-ID")}`}
                    />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        onSuccess={fetchData}
      />
    </div>
  );
}
