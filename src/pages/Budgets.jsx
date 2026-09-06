import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch kategori & transaksi bulan ini untuk kalkulasi pemakaian
      const [catRes, txRes] = await Promise.all([
        API.get("/categories"),
        API.get("/transactions?page=1&limit=100"),
      ]);

      const fetchedCategories =
        catRes.data?.data ||
        catRes.data?.categories ||
        (Array.isArray(catRes.data) ? catRes.data : []);

      const fetchedTx =
        txRes.data?.data ||
        txRes.data?.transactions ||
        (Array.isArray(txRes.data) ? txRes.data : []);

      // Filter hanya kategori pengeluaran untuk budget
      const expenseCats = fetchedCategories.filter(
        (c) => c.type?.toLowerCase() === "expense"
      );

      setCategories(expenseCats);
      setTransactions(fetchedTx);

      if (expenseCats.length > 0 && !categoryId) {
        setCategoryId(expenseCats[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat data budget:", err);
      toast.error("Gagal memuat data anggaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatAmountInput = (value) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(rawValue);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Pilih kategori terlebih dahulu");

    const cleanLimit = parseFloat(budgetLimit.replace(/\./g, ""));
    if (isNaN(cleanLimit) || cleanLimit < 0) {
      return toast.error("Masukkan nominal limit yang valid");
    }

    try {
      // Endpoint update budget limit kategori
      await API.put(`/categories/${categoryId}/budget`, {
        budget_limit: cleanLimit,
      });

      toast.success("Batas anggaran berhasil diperbarui!");
      setBudgetLimit("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan batas anggaran");
    }
  };

  // Filter transaksi bulan ini
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTx = transactions.filter((t) => {
    const rawDate = t.created_at || t.date;
    if (!rawDate) return false;
    const txDate = new Date(rawDate);
    return (
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear &&
      t.type === "expense"
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Budget Planner (Perencanaan Anggaran)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Kontrol batas pengeluaran bulanan agar keuangan tetap sehat
        </p>
      </div>

      {/* Form Atur Budget */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Atur Batas Anggaran Kategori
        </h3>
        <form onSubmit={handleSaveBudget} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            {categories.length === 0 ? (
              <option value="">Belum ada kategori pengeluaran</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>

          <input
            type="text"
            placeholder="Batas Limit Bulanan (Rp)"
            required
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(formatAmountInput(e.target.value))}
            className="p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-2.5 text-xs transition cursor-pointer"
          >
            Simpan Anggaran
          </button>
        </form>
      </div>

      {/* Daftar Monitoring Anggaran */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Monitoring Pengeluaran Bulan Ini
        </h3>

        {loading ? (
          <p className="text-gray-400 text-center py-8 text-xs">Memuat data anggaran...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-xs">Belum ada kategori pengeluaran.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              // Hitung total pengeluaran untuk kategori ini di bulan berjalan
              const spent = currentMonthTx
                .filter((t) => Number(t.category_id) === Number(cat.id))
                .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

              const limit = parseFloat(cat.budget_limit || 0);
              const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800 dark:text-white">
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Limit: Rp {limit.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-300">
                      Terpakai:{" "}
                      <strong className={isOver ? "text-red-500 font-bold" : "text-gray-800 dark:text-gray-100"}>
                        Rp {spent.toLocaleString("id-ID")}
                      </strong>
                    </span>
                    <span className={`font-bold ${isOver ? "text-red-500" : "text-blue-600"}`}>
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
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