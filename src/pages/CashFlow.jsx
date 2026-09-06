import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import CashFlowChart from "../components/CashFlowChart";

export default function CashFlow() {
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCashFlow = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions/cashflow");
      setCashFlowData(res.data.data || []);
    } catch {
      toast.error("Gagal memuat data arus kas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlow();
  }, []);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const totalIncomePeriod = cashFlowData.reduce(
    (acc, item) => acc + parseFloat(item.income || 0),
    0
  );
  const totalExpensePeriod = cashFlowData.reduce(
    (acc, item) => acc + parseFloat(item.expense || 0),
    0
  );
  const netCashFlow = totalIncomePeriod - totalExpensePeriod;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Analisis Arus Kas (Cash Flow)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Evaluasi perbandingan tren pemasukan vs pengeluaran berkala
        </p>
      </div>

      {/* Ringkasan Akumulasi Periode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total Pemasukan (Periode Grafik)
          </span>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
            + {formatRupiah(totalIncomePeriod)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total Pengeluaran (Periode Grafik)
          </span>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            - {formatRupiah(totalExpensePeriod)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Arus Kas Bersih (Net Cash Flow)
          </span>
          <h3
            className={`text-xl font-bold mt-1 ${
              netCashFlow >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {netCashFlow >= 0 ? "+" : ""}
            {formatRupiah(netCashFlow)}
          </h3>
        </div>
      </div>

      {/* Komponen Grafik Arus Kas */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 text-center text-xs text-gray-400 dark:text-gray-500">
            Memuat grafik arus kas...
          </div>
        ) : (
          <CashFlowChart data={cashFlowData} />
        )}
      </div>
    </div>
  );
}