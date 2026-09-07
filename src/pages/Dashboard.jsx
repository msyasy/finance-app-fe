import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Lightbulb, 
  Plus, 
  ArrowRightLeft,
  Tag
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [userName, setUserName] = useState("Pengguna");
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newWalletName, setNewWalletName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");

  const fetchData = async () => {
    try {
      const [meRes, walletRes, txRes] = await Promise.all([
        API.get("/me").catch(() => null),
        API.get("/wallets").catch(() => null),
        API.get("/transactions?page=1&limit=100").catch(() => null),
      ]);

      if (meRes?.data) {
        const u = meRes.data.data || meRes.data;
        setUserName(u.name || u.full_name || u.email?.split("@")[0]);
      }

      if (walletRes?.data) {
        setWallets(walletRes.data.data || walletRes.data.wallets || []);
      }

      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
    } catch (e) {
      console.error("Gagal memuat dashboard", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tambah Dompet Baru
  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    try {
      await API.post("/wallets", { name: newWalletName, balance: 0 });
      toast.success("Dompet berhasil ditambahkan!");
      setNewWalletName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah dompet");
    }
  };

  // Tambah Kategori Baru
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await API.post("/categories", { name: newCategoryName, type: newCategoryType });
      toast.success("Kategori berhasil ditambahkan!");
      setNewCategoryName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah kategori");
    }
  };

  const totalBalance = wallets.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.created_at || t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTx
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalExpense = currentMonthTx
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Keuangan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Selamat Datang kembali, <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{userName}</span>!
        </p>
      </div>

      {/* Ringkasan Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">TOTAL SALDO UTAMA</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-1">Rp {totalBalance.toLocaleString("id-ID")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">PEMASUKAN (BULAN INI)</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">+ Rp {totalIncome.toLocaleString("id-ID")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">PENGELUARAN (BULAN INI)</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">- Rp {totalExpense.toLocaleString("id-ID")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">SAVING RATE</p>
            <p className="text-xl font-black text-amber-500 mt-1">{savingsRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Insights Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          <span>Insights & Analisis Keuangan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-300">
              <span>Savings Rate Bulan Ini</span>
              <span className="text-blue-600 dark:text-blue-400">{savingsRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Target tabungan sehat minimal 20% dari total pendapatan.</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800 flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status Operasional</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {currentMonthTx.length > 0 ? `${currentMonthTx.length} transaksi telah tercatat pada bulan ini.` : "Belum ada transaksi tercatat bulan ini."}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Daftar Dompet & Tambah Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Daftar Dompet */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Wallet size={18} className="text-blue-500" />
                <span>Daftar Dompet</span>
              </h3>
            </div>

            {/* Form Tambah Dompet */}
            <form onSubmit={handleAddWallet} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nama Dompet (contoh: BCA / Cash)"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <Plus size={16} /> Dompet
              </button>
            </form>

            {/* List Dompet dengan Slim Scrollbar */}
            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {wallets.length === 0 ? (
                <p className="col-span-2 text-xs text-gray-400 py-4 text-center">Belum ada dompet.</p>
              ) : (
                wallets.map((w) => (
                  <div key={w.id} className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{w.name}</p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                      Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card Tambah Kategori */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Tag size={18} className="text-blue-500" />
              <span>Tambah Kategori Baru</span>
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tipe Kategori</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Kategori</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama Kategori (contoh: Investasi)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
                  >
                    <Plus size={16} /> Kategori
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}