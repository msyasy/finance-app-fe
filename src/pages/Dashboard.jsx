import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [userName, setUserName] = useState("Pengguna");
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil Nama User Langsung dari Backend (/me atau /profile)
    const fetchUserProfile = async () => {
      try {
        const res = await API.get("/name");
        const data = res.data?.data || res.data;
        const nameFromServer = data?.name || data?.full_name || data?.nama;
        if (nameFromServer) {
          setUserName(nameFromServer);
          // Update juga localStorage agar sinkron
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        // Fallback ke localStorage jika endpoint /me belum ada di backend
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.name || parsed?.full_name) {
              setUserName(parsed.name || parsed.full_name);
            }
          } catch (e) {
            console.error("Gagal parse storage", e);
          }
        }
      }
    };

    // 2. Fetch Data Dashboard (Dompet & Transaksi)
    const fetchDashboardData = async () => {
      setLoading(true);

      // Fetch Dompet
      try {
        const walletRes = await API.get("/wallets");
        const fetchedWallets =
          walletRes.data?.data ||
          walletRes.data?.wallets ||
          (Array.isArray(walletRes.data) ? walletRes.data : []);
        setWallets(fetchedWallets);
      } catch (err) {
        console.error("Gagal memuat data dompet di dashboard:", err);
      }

      // Fetch Transaksi
      try {
        const txRes = await API.get("/transactions?page=1&limit=100");
        const fetchedTx =
          txRes.data?.data ||
          txRes.data?.transactions ||
          (Array.isArray(txRes.data) ? txRes.data : []);
        setTransactions(fetchedTx);
      } catch (err) {
        console.error("Gagal memuat transaksi di dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchDashboardData();
  }, []);

  // Hitung Total Saldo Keseluruhan Dompet
  const totalBalance = wallets.reduce(
    (acc, curr) => acc + (parseFloat(curr.balance) || 0),
    0
  );

  // Filter Transaksi Khusus Bulan & Tahun Berjalan
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const rawDate = t.created_at || t.date;
    if (!rawDate) return false;
    const txDate = new Date(rawDate);
    return (
      txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    );
  });

  // Hitung Total Pemasukan & Pengeluaran BULAN INI
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  // Kalkulasi Savings Rate Bulan Ini
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  // 5 Transaksi Paling Terakhir
  const recentTransactions = transactions.slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Keuangan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Selamat Datang kembali,{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">
            {userName}
          </span>
          !
        </p>
      </div>

      {/* Ringkasan Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Total Saldo
          </p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            Rp {totalBalance.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Pemasukan (Bulan Ini)
          </p>
          <p className="text-xl font-black text-green-600 dark:text-green-400 mt-1">
            + Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Pengeluaran (Bulan Ini)
          </p>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            - Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Saving Rate
          </p>
          <p className="text-xl font-black text-amber-500 mt-1">
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Insight & Analisis */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span>💡</span> Insights & Analisis Keuangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
              <span>Savings Rate Bulan Ini</span>
              <span className="font-bold text-blue-600">{savingsRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Target tabungan sehat minimal 20% dari total pendapatan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Status Operasional
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {loading
                ? "Memuat data dari server..."
                : currentMonthTransactions.length > 0
                ? `${currentMonthTransactions.length} transaksi tercatat di bulan ini.`
                : "Belum ada transaksi tercatat bulan ini."}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Transaksi Terakhir */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              5 Transaksi Terakhir
            </h3>
            <p className="text-xs text-gray-400">Aktivitas mutasi dana terbaru</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lihat Semua Transaksi &rarr;
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8 text-xs">
              Belum ada transaksi tercatat.
            </p>
          ) : (
            recentTransactions.map((t) => {
              const isIncome = t.type === "income";
              return (
                <div key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs">
                      {t.notes || "Transaksi"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(t.created_at || t.date)}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-xs ${
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