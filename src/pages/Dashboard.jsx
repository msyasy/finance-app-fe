import React, { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
  Receipt,
  Lightbulb,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../services/api";

const CATEGORY_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
];

export default function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, catRes, txRes, cfRes] = await Promise.all([
        API.get("/wallets"),
        API.get("/categories"),
        API.get("/transactions?page=1&limit=1000"),
        API.get("/transactions/cashflow"),
      ]);

      if (walletRes?.data) {
        setWallets(walletRes.data.data || walletRes.data.wallets || []);
      }
      if (catRes?.data) {
        setCategories(catRes.data.data || catRes.data.categories || []);
      }
      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
      if (cfRes?.data) {
        setCashFlowData(cfRes.data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Total Saldo
  const totalBalance = wallets.reduce(
    (acc, w) => acc + (parseFloat(w.balance) || 0),
    0,
  );

  // Transaksi Bulan Ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTx = transactions.filter((tx) => {
    const d = new Date(tx.created_at || tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTx
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);

  const totalExpense = currentMonthTx
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);

  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

  // Logika Status & Warna Alert
  let statusBadge = {
    label: "Sangat Sehat",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-600",
  };
  let showAlertBanner = false;

  if (savingsRate < 10) {
    statusBadge = {
      label: "Waspada / Boros",
      textClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-600",
    };
    showAlertBanner = true;
  } else if (savingsRate < 20) {
    statusBadge = {
      label: "Cukup Sehat",
      textClass: "text-amber-500",
      bgClass: "bg-amber-500",
    };
  }

  // Pie Chart Data
  const categoryMap = {};
  currentMonthTx
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const catObj = categories.find(
        (c) => String(c.id) === String(tx.category_id),
      );
      const catName = tx.category?.name || catObj?.name || "Lainnya";
      categoryMap[catName] =
        (categoryMap[catName] || 0) + (parseFloat(tx.amount) || 0);
    });

  const categoryPieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  // URUTKAN DOMPET: Dari Saldo Terbesar ke Terkecil, lalu batasi maksimal 4
  const sortedWallets = [...wallets]
    .sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400">
          Memuat data keuangan...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER & RINGKASAN SALDO SEJAJAR */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        {/* Kiri: Teks Sapaan */}
        <div className="shrink-0">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Dashboard Keuangan
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Selamat Datang kembali,{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Pengguna
            </span>
            !
          </p>
        </div>

        {/* Kanan: 4 Kartu Ringkasan Sejajar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto flex-1">
          {/* Total Saldo */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                Total Saldo
              </p>
              <h3 className="text-xs font-black text-gray-900 dark:text-white mt-0.5 truncate">
                Rp {totalBalance.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-100/60 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet size={14} />
            </div>
          </div>

          {/* Pemasukan */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                Pemasukan
              </p>
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                + Rp {totalIncome.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={14} />
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                Pengeluaran
              </p>
              <h3 className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                - Rp {totalExpense.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-100/60 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown size={14} />
            </div>
          </div>

          {/* Saving Rate */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                Saving Rate
              </p>
              <h3
                className={`text-xs font-black mt-0.5 ${statusBadge.textClass}`}
              >
                {savingsRate}%
              </h3>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-100/60 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
              <Percent size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Saldo Per Dompet (Maksimal 4, Urut Terbesar ke Terkecil) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CreditCard
              size={18}
              className="text-blue-600 dark:text-blue-400"
            />
            Saldo Rekening
          </h3>
          <Link
            to="/wallets"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Kelola Dompet <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sortedWallets.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 col-span-full text-center">
              Belum ada dompet terdaftar.
            </p>
          ) : (
            sortedWallets.map((w) => (
              <div
                key={w.id}
                className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl space-y-1"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {w.name}
                </p>
                <p className="text-base font-extrabold text-gray-900 dark:text-white">
                  Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arus Kas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
            Tren Arus Kas (6 Bulan Terakhir)
          </h3>

          <div className="h-64 w-full pt-2">
            {cashFlowData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-20">
                Data arus kas belum tersedia.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "",
                    ]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pengeluaran Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <PieIcon size={18} className="text-rose-500" />
            Pengeluaran Bulan Ini
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryPieData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center">
                Belum ada pengeluaran bulan ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "",
                    ]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          Insights & Analisis Kesehatan Keuangan
        </h3>

        {showAlertBanner && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <AlertTriangle
              size={18}
              className="shrink-0 text-rose-600 dark:text-rose-400"
            />
            <p className="text-xs font-semibold leading-relaxed">
              <strong>Peringatan Finansial:</strong> Savings rate kamu bulan ini
              hanya <strong>{savingsRate}%</strong> (kurang dari batas aman
              20%). Pengeluaran kamu hampir menguras seluruh pemasukan bulanan!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-600 dark:text-gray-300">
                Savings Rate Bulan Ini
              </span>
              <span className={`font-bold ${statusBadge.textClass}`}>
                {savingsRate}% ({statusBadge.label})
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${statusBadge.bgClass}`}
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400">
              Target tabungan sehat minimal 20% dari total pendapatan.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Status Operasional
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-bold text-gray-800 dark:text-white">
                  {currentMonthTx.length}
                </span>{" "}
                transaksi telah tercatat pada bulan ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt size={18} className="text-blue-600 dark:text-blue-400" />
            Transaksi Terakhir
          </h3>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              Belum ada transaksi recorded.
            </p>
          ) : (
            transactions.slice(0, 5).map((tx) => {
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
                  className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl"
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
