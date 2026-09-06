import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function BudgetProgressCard({
  categories,
  transactions,
  onBudgetUpdated,
}) {
  const [editingId, setEditingId] = useState(null);
  const [inputBudget, setInputBudget] = useState("");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const expenseMap = {};
  transactions.forEach((t) => {
    const d = new Date(t.created_at || Date.now());
    if (
      t.type === "expense" &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    ) {
      expenseMap[t.category_id] =
        (expenseMap[t.category_id] || 0) + parseFloat(t.amount);
    }
  });

  const handleSaveBudget = async (catId) => {
    const cleanAmount = parseFloat(inputBudget.replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount < 0) {
      toast.error("Masukkan nominal yang valid");
      return;
    }

    try {
      await API.put(`/categories/${catId}/budget`, {
        budget_limit: cleanAmount,
      });
      toast.success("Batas anggaran berhasil disimpan!");
      setEditingId(null);
      setInputBudget("");
      onBudgetUpdated();
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Batas Anggaran Bulanan
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Pengawasan batas pengeluaran per kategori
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {expenseCategories.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Belum ada kategori pengeluaran.
          </p>
        ) : (
          expenseCategories.map((cat) => {
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
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{cat.name}</span>
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
                              .replace(/\B(?=(\d{3})+(?!\d))/g, "."),
                          )
                        }
                        className="w-28 p-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 outline-none"
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.id)}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded text-xs cursor-pointer"
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
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px] cursor-pointer"
                    >
                      {limit > 0 ? "Edit Anggaran" : "+ Set Anggaran"}
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

                {limit > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}