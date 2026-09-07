import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Lightbulb, 
  Receipt,
  ArrowRight
} from "lucide-react";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Pengguna");
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);

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

  // Ambil 5 Transaksi Terakhir
  const recentTransactions = transactions.slice(0, 5);

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

      {/* Section: 5 Transaksi Terakhir */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt size={18} className="text-blue-500" />
            <span>Transaksi Terakhir</span>
          </h3>
          <button
            onClick={() => navigate("/transactions")}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">Belum ada transaksi recorded.</p>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const formattedDate = new Date(tx.created_at || tx.date).toLocaleDateString("id-ID", {
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
                      {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-white">
                        {tx.note || tx.category?.name || "Transaksi"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formattedDate} • <span className="font-medium text-gray-500 dark:text-gray-400">{tx.wallet?.name || "Dompet"}</span>
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-xs font-extrabold ${
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"} Rp {(parseFloat(tx.amount) || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}