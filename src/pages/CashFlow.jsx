import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Cashflow() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/transactions?page=1&limit=500");
      const fetchedTx =
        res.data?.data ||
        res.data?.transactions ||
        (Array.isArray(res.data) ? res.data : []);
      setTransactions(fetchedTx);
    } catch (err) {
      console.error("Gagal memuat arus kas:", err);
      toast.error("Gagal memuat data arus kas dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Kelompokkan transaksi per bulan (6 bulan terakhir)
  const monthlyData = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    monthlyData[key] = {
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      income: 0,
      expense: 0,
    };
  }

  transactions.forEach((t) => {
    const rawDate = t.created_at || t.date;
    if (!rawDate) return;
    const txDate = new Date(rawDate);
    const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
    
    if (monthlyData[key]) {
      const amount = parseFloat(t.amount) || 0;
      if (t.type === "income") {
        monthlyData[key].income += amount;
      } else if (t.type === "expense") {
        monthlyData[key].expense += amount;
      }
    }
  });

  const cashflowList = Object.values(monthlyData);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Arus Kas (Cashflow Bulanan)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Ringkasan perbandingan total pemasukan dan pengeluaran per bulan
        </p>
      </div>

      {/* Tabel Arus Kas */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tren Arus Kas 6 Bulan Terakhir
        </h3>

        {loading ? (
          <p className="text-gray-400 text-center py-10 text-xs">Memuat data arus kas...</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {cashflowList.map((item, index) => {
              const net = item.income - item.expense;
              return (
                <div key={index} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                      {item.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Net:{" "}
                      <span className={net >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        Rp {net.toLocaleString("id-ID")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-gray-400 block">Pemasukan</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        + Rp {item.income.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Pengeluaran</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        - Rp {item.expense.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}