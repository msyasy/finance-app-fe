import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign
} from "lucide-react";
import API from "../services/api";

export default function CashFlow() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/transactions?page=1&limit=500").catch(() => null);
      if (res?.data) {
        setTransactions(res.data.data || res.data.transactions || []);
      }
    } catch (err) {
      console.error("Gagal memuat data arus kas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Kelompokkan data transaksi berdasarkan 6 bulan terakhir
  const getMonthlyStats = () => {
    const monthlyData = {};
    const months = [];

    // Hasilkan label 6 bulan terakhir
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
      
      months.push(key);
      monthlyData[key] = { label, income: 0, expense: 0 };
    }

    // Akumulasikan transaksi
    transactions.forEach((tx) => {
      const txDate = new Date(tx.created_at || tx.date);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
      
      if (monthlyData[key]) {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.type === "income") {
          monthlyData[key].income += amt;
        } else if (tx.type === "expense") {
          monthlyData[key].expense += amt;
        }
      }
    });

    return months.map((k) => monthlyData[k]);
  };

  const stats = getMonthlyStats();

  // Cari angka tertinggi untuk kalkulasi tinggi grafik
  const maxVal = Math.max(
    ...stats.flatMap((s) => [s.income, s.expense]),
    100000
  );

  // Perhitungan Bulan Ini
  const currentMonthStat = stats[stats.length - 1] || { income: 0, expense: 0 };
  const netCashFlow = currentMonthStat.income - currentMonthStat.expense;

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
          Arus Kas (Cash Flow)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Analisis perbandingan mutasi masuk dan keluar untuk memantau surplus atau defisit.
        </p>
      </div>

      {/* Ringkasan Statistik Bulan Ini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">PEMASUKAN (BULAN INI)</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            + Rp {currentMonthStat.income.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">PENGELUARAN (BULAN INI)</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            - Rp {currentMonthStat.expense.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">BERSIH (NET CASHFLOW)</p>
          <p className={`text-xl font-black mt-1 ${netCashFlow >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
            {netCashFlow >= 0 ? "+" : ""} Rp {netCashFlow.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Grafik Tren Arus Kas */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">Tren Arus Kas (6 Bulan Terakhir)</h3>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-gray-600 dark:text-gray-300">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
              <span className="text-gray-600 dark:text-gray-300">Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="pt-8 pb-4 h-64 flex items-end justify-between gap-2 md:gap-6 border-b border-gray-100 dark:border-slate-800">
          {stats.map((s, idx) => {
            const incomeHeight = Math.max(Math.round((s.income / maxVal) * 100), 4);
            const expenseHeight = Math.max(Math.round((s.expense / maxVal) * 100), 4);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Bar Pemasukan */}
                  <div
                    className="w-1/2 max-w-[24px] bg-emerald-500 rounded-t-md transition-all duration-300 relative group-hover:bg-emerald-400"
                    style={{ height: `${s.income > 0 ? incomeHeight : 2}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 transition">
                      +Rp {s.income.toLocaleString("id-ID")}
                    </div>
                  </div>

                  {/* Bar Pengeluaran */}
                  <div
                    className="w-1/2 max-w-[24px] bg-rose-500 rounded-t-md transition-all duration-300 relative group-hover:bg-rose-400"
                    style={{ height: `${s.expense > 0 ? expenseHeight : 2}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 transition">
                      -Rp {s.expense.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Label Bulan */}
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-3">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}