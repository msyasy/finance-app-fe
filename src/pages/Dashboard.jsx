import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API from "../services/api";
import FinancialInsightCard from "../components/FinancialInsightCard";
import CashFlowChart from "../components/CashFlowChart";
import { calculateSavingsRate } from "../utils/insightUtils";

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
  const [cashFlowData, setCashFlowData] = useState([]);

  // Ambil data user secara dinamis dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || user.username || user.email || "Pengguna";

  const fetchData = async () => {
    try {
      const [walletRes, txRes, catRes, cfRes] = await Promise.all([
        API.get("/wallets"),
        API.get("/transactions?page=1&limit=5"), // Ambil 5 transaksi terakhir saja
        API.get("/categories"),
        API.get("/transactions/cashflow"),
      ]);

      setWallets(walletRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setCategories(catRes.data.data || []);
      setCashFlowData(cfRes.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data dashboard", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper Formatter
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  // Kalkulasi Saldo, Income, Expense
  const totalBalance = wallets.reduce(
    (acc, w) => acc + parseFloat(w.balance || 0),
    0,
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.created_at || Date.now());
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const totalExpense = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

  // Data Insight Pembanding
  const lastMonthData = cashFlowData[currentMonth - 1];
  const lastMonthExpense = lastMonthData ? parseFloat(lastMonthData.expense || 0) : 0;
  const last3MonthsData = cashFlowData.slice(
    Math.max(0, currentMonth - 3),
    currentMonth
  );
  const avgThreeMonthsExpense =
    last3MonthsData.length > 0
      ? last3MonthsData.reduce(
          (acc, curr) => acc + parseFloat(curr.expense || 0),
          0
        ) / last3MonthsData.length
      : 0;

  // Donut Chart Data
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

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HEADER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Keuangan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Selamat Datang kembali,{" "}
          <strong className="text-blue-600 dark:text-blue-400">
            {userName}
          </strong>
          !
        </p>
      </div>

      {/* 2. RINGKASAN 4 CARD UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Total Saldo
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatRupiah(totalBalance)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Pemasukan
          </p>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
            + {formatRupiah(totalIncome)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Pengeluaran
          </p>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            - {formatRupiah(totalExpense)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Saving Rate
          </p>
          <h3
            className={`text-xl font-bold mt-1 ${
              savingsRate < 20 ? "text-amber-500" : "text-emerald-500"
            }`}
          >
            {savingsRate}%
          </h3>
        </div>
      </div>

      {/* 3. INSIGHT KEUNANGAN */}
      <FinancialInsightCard
        income={totalIncome}
        expense={totalExpense}
        lastMonthExpense={lastMonthExpense}
        avgThreeMonthsExpense={avgThreeMonthsExpense}
      />

      {/* 4. GRAFIK ARUS KAS & DONUT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart data={cashFlowData} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Pengeluaran Bulan Ini
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-3">
              Alokasi berdasarkan kategori
            </p>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs italic py-10">
              Belum ada pengeluaran bulan ini.
            </div>
          ) : (
            <div className="w-full h-60 my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
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
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 5. WIDGET 5 TRANSAKSI TERAKHIR */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              5 Transaksi Terakhir
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Aktivitas mutasi dana terbaru
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Lihat Semua Transaksi &rarr;
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {transactions.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-6 text-sm italic">
              Belum ada transaksi tercatat.
            </p>
          ) : (
            transactions.map((t) => {
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}