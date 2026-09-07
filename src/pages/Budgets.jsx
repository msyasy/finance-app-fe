import React, { useEffect, useState } from "react";
import { 
  PieChart, 
  Pencil, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Coins
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal Edit Budget State
  const [editCategory, setEditCategory] = useState(null);
  const [budgetLimit, setBudgetLimit] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, txRes] = await Promise.all([
        API.get("/categories").catch(() => null),
        API.get("/transactions?page=1&limit=200").catch(() => null),
      ]);

      if (catRes?.data) {
        const cList = catRes.data.data || catRes.data.categories || [];
        // Filter khusus kategori Pengeluaran (Expense)
        setCategories(cList.filter((c) => c.type === "expense"));
      }

      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
    } catch (err) {
      console.error("Gagal memuat data budget", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung total pengeluaran bulan ini per kategori
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions.filter((t) => {
    const d = new Date(t.created_at || t.date);
    return (
      t.type === "expense" &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  });

  // Buka Modal Edit Budget Limit
  const handleOpenEdit = (cat) => {
    setEditCategory(cat);
    setBudgetLimit(cat.budget_limit || cat.budget || "");
  };

  // Submit Update Budget Limit
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!editCategory) return;

    try {
      await API.put(`/categories/${editCategory.id}`, {
        name: editCategory.name,
        type: editCategory.type,
        budget_limit: parseFloat(budgetLimit) || 0,
      });

      toast.success(`Batas anggaran untuk ${editCategory.name} berhasil diperbarui!`);
      setEditCategory(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui anggaran");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <PieChart size={24} className="text-blue-600 dark:text-blue-400" />
          Budget Planner
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Tetapkan batas pengeluaran bulanan per kategori untuk menjaga kondisi keuangan tetap sehat.
        </p>
      </div>

      {/* Grid List Kategori & Progress Anggaran */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">Batas Anggaran Bulanan</h3>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-10">
              <Coins size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-400">Belum ada kategori pengeluaran.</p>
            </div>
          ) : (
            categories.map((cat) => {
              // Hitung akumulasi terpakai untuk kategori ini di bulan berjalan
              const spent = currentMonthExpenses
                .filter((t) => String(t.category_id) === String(cat.id))
                .reduce((sum, curr) => sum + (parseFloat(curr.amount) || 0), 0);

              const limit = parseFloat(cat.budget_limit || cat.budget) || 0;
              const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div
                  key={cat.id}
                  className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl space-y-2 hover:border-gray-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {cat.name}
                        {isOver && (
                          <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-full font-semibold">
                            <AlertTriangle size={12} /> Melebihi Limit
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Terpakai:{" "}
                        <span className={`font-semibold ${isOver ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          Rp {spent.toLocaleString("id-ID")}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Limit</p>
                        <p className="text-xs font-extrabold text-gray-800 dark:text-white">
                          {limit > 0 ? `Rp ${limit.toLocaleString("id-ID")}` : "Belum diatur"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition cursor-pointer"
                        title="Set Batas Anggaran"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {limit > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOver
                            ? "bg-rose-500"
                            : percent > 80
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Edit Budget Limit */}
      {editCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Atur Anggaran: {editCategory.name}
            </h4>

            <form onSubmit={handleUpdateBudget} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Batas Pengeluaran Bulanan (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}