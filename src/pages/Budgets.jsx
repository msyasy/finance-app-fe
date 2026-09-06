import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [inputBudget, setInputBudget] = useState("");
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, txRes] = await Promise.all([
        API.get("/categories"),
        API.get(`/transactions?page=1&limit=1000`),
      ]);

      setCategories(catRes.data.data || []);
      setTransactions(txRes.data.data || []);
    } catch {
      toast.error("Gagal memuat data anggaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Kalkulasi total pengeluaran bulan ini per kategori
  const expenseMap = {};
  transactions.forEach((t) => {
    const d = new Date(t.created_at || t.date || Date.now());
    if (
      t.type === "expense" &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    ) {
      expenseMap[t.category_id] =
        (expenseMap[t.category_id] || 0) + parseFloat(t.amount || 0);
    }
  });

  const handleSaveBudget = async (catId) => {
    const cleanAmount = parseFloat(inputBudget.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount < 0) {
      return toast.error("Masukkan nominal anggaran yang valid");
    }

    try {
      await API.put(`/categories/${catId}/budget`, {
        budget_limit: cleanAmount,
      });
      toast.success("Batas anggaran berhasil diperbarui!");
      setEditingId(null);
      setInputBudget("");
      fetchData();
    } catch {
      toast.error("Gagal menyimpan anggaran");
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Budget Planner
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Atur dan pantau batas pengeluaran bulanan per kategori
        </p>
      </div>

      {/* Konten Utama */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Pengawasan Anggaran Kategori
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
            Memuat data anggaran...
          </div>
        ) : expenseCategories.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500 italic">
            Belum ada kategori pengeluaran. Buat kategori terlebih dahulu di menu Kategori.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenseCategories.map((cat) => {
              const spent = expenseMap[cat.id] || 0;
              const limit = parseFloat(cat.budget_limit || 0);
              const percentage =
                limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-600 dark:text-emerald-400";
              if (limit > 0) {
                if (spent >= limit || percentage >= 90) {
                  barColor = "bg-rose-500";
                  textColor = "text-rose-600 dark:text-rose-400 font-bold";
                } else if (percentage >= 75) {
                  barColor = "bg-amber-500";
                  textColor = "text-amber-600 dark:text-amber-400";
                }
              }

              return (
                <div
                  key={cat.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {cat.name}
                    </span>

                    {editingId === cat.id ? (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          placeholder="Limit Rp"
                          value={inputBudget}
                          onChange={(e) =>
                            setInputBudget(
                              e.target.value
                                .replace(/\D/g, "")
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            )
                          }
                          className="w-28 p-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 outline-none"
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setInputBudget(limit ? limit.toString() : "");
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs cursor-pointer"
                      >
                        {limit > 0 ? "Edit Limit" : "+ Set Limit"}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Terpakai:{" "}
                      <strong className={textColor}>{formatRupiah(spent)}</strong>
                    </span>
                    <span>
                      Limit:{" "}
                      <strong className="text-gray-700 dark:text-gray-300">
                        {limit > 0 ? formatRupiah(limit) : "Belum diatur"}
                      </strong>
                    </span>
                  </div>

                  {limit > 0 ? (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                        <span>Penggunaan: {percentage.toFixed(0)}%</span>
                        {spent >= limit && (
                          <span className="text-rose-500 font-bold">Over Budget!</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                      Batas anggaran belum diatur untuk kategori ini.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}