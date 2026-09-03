import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

  // State Kategori Baru
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchData = async () => {
    // 1. Fetch Wallets
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

    // 2. Fetch Transactions
    try {
      const txRes = await API.get("/transactions");
      setTransactions(txRes.data.data || []);
    } catch {
      setTransactions([]);
    }

    // 3. Fetch Categories
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
  }, []);

  // Update categoryId pilihan otomatis saat tipe transaksi diubah
  const handleTypeChange = (newType) => {
    setType(newType);
    const availableCats = categories.filter((c) => c.type === newType);
    if (availableCats.length > 0) {
      setCategoryId(availableCats[0].id);
    } else {
      setCategoryId("");
    }
  };

  // Handler Tambah Kategori
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/categories", {
        name: newCategoryName,
        type: newCategoryType,
      });
      setNewCategoryName("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat kategori");
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/wallets", {
        name: newWalletName,
        balance: 0,
      });
      setNewWalletName("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat dompet");
    }
  };

  const handleDeleteWallet = async (id, name) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus dompet "${name}"? Semua transaksi di dalamnya juga akan terhapus.`
      )
    )
      return;
    try {
      await API.delete(`/wallets/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menghapus dompet");
    }
  };

  // Helper format input angka otomatis dengan titik ribuan
  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, ""); // Ambil angka saja
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError("");

    if (!walletId) {
      setError("Silakan buat dan pilih dompet terlebih dahulu");
      return;
    }

    if (!categoryId) {
      setError("Silakan buat dan pilih kategori terlebih dahulu");
      return;
    }

    // Bersihkan karakter titik sebelum diubah ke float
    const cleanAmount = parseFloat(amount.replace(/\./g, ""));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError("Masukkan nominal yang valid");
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
      setAmount("");
      setNotes("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambahkan transaksi");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch {
      alert("Gagal menghapus transaksi");
    }
  };

  // Filter list kategori sesuai dengan tipe transaksi yang terpilih saat ini
  const filteredCategories = categories.filter((c) => c.type === type);

  // --- LOGIKA HELPER & RINGKASAN KEUANGAN ---
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

  // 1. Total Saldo Semua Dompet
  const totalBalance = wallets.reduce(
    (acc, wallet) => acc + parseFloat(wallet.balance || 0),
    0
  );

  // Filter transaksi bulan ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const transDate = new Date(t.created_at || Date.now());
    return (
      transDate.getMonth() === currentMonth &&
      transDate.getFullYear() === currentYear
    );
  });

  // 2. Total Pemasukan Bulan Ini
  const totalIncome = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  // 3. Total Pengeluaran Bulan Ini
  const totalExpense = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
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
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Section Ringkasan Keuangan (3 Card) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Saldo */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Saldo Utama
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {formatRupiah(totalBalance)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Pemasukan */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pemasukan (Bulan Ini)
              </p>
              <h3 className="text-xl font-bold text-green-600 mt-1">
                + {formatRupiah(totalIncome)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pengeluaran (Bulan Ini)
              </p>
              <h3 className="text-xl font-bold text-red-600 mt-1">
                - {formatRupiah(totalExpense)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Section Dompet & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kelola Dompet */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Daftar Dompet</h3>
            <form onSubmit={handleCreateWallet} className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Dompet (contoh: Cash / BCA)"
                required
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 transition cursor-pointer"
              >
                + Dompet
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {wallets.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Belum ada dompet.
                </p>
              ) : (
                wallets.map((w) => (
                  <div
                    key={w.id}
                    className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center"
                  >
                    <div>
                      <p className="text-blue-100 text-xs font-medium">
                        {w.name}
                      </p>
                      <h2 className="text-xl font-bold mt-1">
                        Rp {parseFloat(w.balance).toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleDeleteWallet(w.id, w.name)}
                      className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kelola Kategori */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
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
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white font-semibold"
              >
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Kategori (contoh: Bonus / Investasi)"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 transition cursor-pointer"
                >
                  + Kategori
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Form Catat Transaksi */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Catat Transaksi Baru
          </h3>
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleAddTransaction}
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
          >
            {/* Dropdown Dompet */}
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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

            {/* Dropdown Tipe */}
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
            >
              <option value="expense">Pengeluaran (-)</option>
              <option value="income">Pemasukan (+)</option>
            </select>

            {/* Dropdown Kategori Dinamis */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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

            {/* Input Nominal Text dengan Format Titik Ribuan */}
            <input
              type="text"
              placeholder="Jumlah (Rp)"
              required
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Catatan"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg p-2 transition cursor-pointer"
            >
              + Tambah
            </button>
          </form>
        </div>

        {/* Riwayat Transaksi */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Riwayat Transaksi
          </h3>
          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada transaksi.
              </p>
            ) : (
              transactions.map((t) => {
                const isIncome = t.type === "income";

                // Cari nama dompet & kategori
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
                      <p className="font-semibold text-gray-800">
                        {t.notes} {categoryName ? `• ${categoryName}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(t.created_at || t.date)} •{" "}
                        <span className="font-medium text-gray-500">
                          {walletName}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-bold ${
                          isIncome ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"} Rp{" "}
                        {parseFloat(t.amount).toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-red-400 hover:text-red-700 text-sm font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}