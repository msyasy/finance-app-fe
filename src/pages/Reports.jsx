import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter tanggal laporan
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "/transactions?page=1&limit=500";
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const [txRes, walletRes] = await Promise.all([
        API.get(url),
        API.get("/wallets"),
      ]);

      const fetchedTx =
        txRes.data?.data ||
        txRes.data?.transactions ||
        (Array.isArray(txRes.data) ? txRes.data : []);

      const fetchedWallets =
        walletRes.data?.data ||
        walletRes.data?.wallets ||
        (Array.isArray(walletRes.data) ? walletRes.data : []);

      setTransactions(fetchedTx);
      setWallets(fetchedWallets);
    } catch (err) {
      console.error("Gagal memuat laporan:", err);
      toast.error("Gagal memuat data laporan dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Kalkulasi total laporan
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // Fitur Download CSV Laporan
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      return toast.error("Tidak ada data transaksi untuk diekspor");
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Tanggal,Tipe,Nominal,Catatan\n";
    transactions.forEach((t) => {
      const date = t.created_at || t.date || "";
      const row = [t.id, date, t.type, t.amount, `"${t.notes || ""}"`].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_keuangan_${startDate || "semua"}_sd_${endDate || "sekarang"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Laporan berhasil diunduh dalam format CSV!");
  };

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
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Laporan & Ekspor Data
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Unduh rekapitulasi transaksi dan analisis laporan keuangan
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
        >
          📥 Unduh CSV Laporan
        </button>
      </div>

      {/* Filter Rentang Tanggal */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Filter Periode Laporan
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 outline-none"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="mt-5 text-red-500 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Statistik Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Total Pemasukan Periode Ini
          </p>
          <p className="text-xl font-black text-green-600 dark:text-green-400 mt-1">
            + Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Total Pengeluaran Periode Ini
          </p>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            - Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Net Surplus / Defisit
          </p>
          <p className={`text-xl font-black mt-1 ${netBalance >= 0 ? "text-blue-600" : "text-amber-500"}`}>
            Rp {netBalance.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tabel Preview Rekap Transaksi */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Preview Data Transaksi Laporan ({transactions.length} item)
        </h3>

        {loading ? (
          <p className="text-gray-400 text-center py-10 text-xs">Memuat laporan...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-10 text-xs">Tidak ada data transaksi pada periode ini.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {transactions.map((t) => {
              const isIncome = t.type === "income";
              return (
                <div key={t.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {t.notes || "Transaksi"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(t.created_at || t.date)}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"} Rp {parseFloat(t.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}