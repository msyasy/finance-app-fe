import React, { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  Fingerprint,
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
import toast from "react-hot-toast";
import { registerBiometrics, isWebAuthnSupported } from "../services/webauthn";

const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
];

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

export default function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regBioLoading, setRegBioLoading] = useState(false);

  const handleRegisterBiometric = async () => {
    setRegBioLoading(true);
    try {
      const res = await registerBiometrics();
      toast.success(res?.message || "Biometrik (Passkey) berhasil didaftarkan!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Gagal mendaftarkan biometrik",
      );
    } finally {
      setRegBioLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, catRes, txRes, cfRes] = await Promise.all([
        API.get("/wallets").catch(() => null),
        API.get("/categories").catch(() => null),
        API.get("/transactions?page=1&limit=1000").catch(() => null),
        API.get("/transactions/cashflow").catch(() => null),
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

    // Listen event global dari Floating Button / Transaction Actions
    const handleTxUpdate = () => {
      fetchData();
    };
    window.addEventListener("transactionUpdated", handleTxUpdate);
    return () => {
      window.removeEventListener("transactionUpdated", handleTxUpdate);
    };
  }, []);

  // Total Saldo dari seluruh dompet
  const totalBalance = wallets.reduce(
    (acc, w) => acc + (parseFloat(w.balance) || 0),
    0,
  );

  // Ambil Pemasukan & Pengeluaran bulan ini secara akurat langsung dari data agregat CashFlow backend SQL
  const latestMonthCF =
    cashFlowData.length > 0
      ? cashFlowData[cashFlowData.length - 1]
      : { income: 0, expense: 0 };
  const totalIncome = latestMonthCF.income || 0;
  const totalExpense = latestMonthCF.expense || 0;

  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

  // Pie Chart Kategori Pengeluaran Bulan Ini
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTx = transactions.filter((tx) => {
    const d = parseDateSafe(tx.created_at || tx.date);
    return (
      d !== null &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  });

  // Jika transaksi bulan ini kosong/belum ada yang cocok bulan ini, gunakan seluruh transaksi pengeluaran sebagai fallback agar grafik tetap tampil
  const pieSourceTx =
    currentMonthTx.length > 0
      ? currentMonthTx
      : transactions.filter((tx) => tx.type === "expense");

  const categoryMap = {};
  pieSourceTx
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

  // Ambil HANYA 4 dompet dengan saldo terbesar
  const sortedWallets = [...wallets]
    .sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0))
    .slice(0, 4);

  // SKELETON LOADER STATE
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        {/* Header & 4 Ringkasan Cards Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 shrink-0 w-48">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
            <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-lg w-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Saldo Rekening 4 Dompet Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-lg w-40"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-24"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2"
              >
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Grafik Arus Kas & Pengeluaran Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-lg w-52"></div>
            <div className="h-64 bg-gray-50 dark:bg-slate-800/40 rounded-xl"></div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 flex flex-col">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-lg w-44"></div>
            <div className="flex-1 min-h-[220px] bg-gray-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-8 border-gray-200 dark:border-slate-700"></div>
            </div>
          </div>
        </div>

        {/* Transaksi Terakhir Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-lg w-36"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-20"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER & RINGKASAN SALDO */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6">
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
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
          {isWebAuthnSupported() && (
            <button
              onClick={handleRegisterBiometric}
              disabled={regBioLoading}
              className="mt-2 sm:mt-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Fingerprint size={15} />
              {regBioLoading ? "Mendaftarkan..." : "Aktifkan Passkey Biometrik"}
            </button>
          )}
        </div>

        {/* 4 Kartu Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto flex-1">
          {/* Total Saldo */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Total Saldo
              </p>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                Rp {totalBalance.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100/60 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet size={16} />
            </div>
          </div>

          {/* Pemasukan */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Pemasukan
              </p>
              <h3 className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                + Rp {totalIncome.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Pengeluaran
              </p>
              <h3 className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                - Rp {totalExpense.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-100/60 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown size={16} />
            </div>
          </div>

          {/* Saving Rate */}
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Saving Rate
              </p>
              <h3 className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                {savingsRate}%
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100/60 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Percent size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Rincian 4 Dompet Terbanyak */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wallet size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            Saldo Rekening & Dompet
          </h3>
          <Link
            to="/wallets"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Kelola Dompet <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedWallets.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 col-span-full text-center">
              Belum ada dompet terdaftar.
            </p>
          ) : (
            sortedWallets.map((w) => (
              <div
                key={w.id}
                className="p-3.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {w.name}
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    Rp {(parseFloat(w.balance) || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GRAFIK ARUS KAS & PENGELUARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tren Arus Kas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            Tren Arus Kas (6 Bulan Terakhir)
          </h3>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val) => `Rp ${val.toLocaleString("id-ID")}`}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pengeluaran Bulan Ini Per Kategori */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 flex flex-col">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <PieIcon size={18} className="text-rose-500 shrink-0" />
            Pengeluaran Bulan Ini
          </h3>

          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {categoryPieData.length === 0 ? (
              <p className="text-xs text-gray-400 py-12 text-center">
                Belum ada pengeluaran bulan ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
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
                    formatter={(val) => `Rp ${val.toLocaleString("id-ID")}`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
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
              Belum ada transaksi tercatat.
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

              const formattedDate = formatTxDate(tx.created_at || tx.date);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 sm:p-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                        {displayTitle}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {formattedDate} •{" "}
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          {walletName}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
