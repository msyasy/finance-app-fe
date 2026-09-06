import React from "react";
import {
  calculateSavingsRate,
  calculateExpenseComparison,
  checkSmartAlert,
} from "../utils/insightUtils";

const FinancialInsightCard = ({
  income = 0,
  expense = 0,
  lastMonthExpense = 0,
  avgThreeMonthsExpense = 0,
}) => {
  const savingsRate = calculateSavingsRate(income, expense);
  const comparison = calculateExpenseComparison(expense, lastMonthExpense);
  const isOverBudget3Months = checkSmartAlert(expense, avgThreeMonthsExpense);

  // Alert tetap bertahan selama rasio tabungan di bawah 20%
  const isLowSavings = income > 0 && savingsRate < 20;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 space-y-4 transition-colors">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
        💡 Insights & Analisis Keuangan
      </h3>

      {/* Warning Box Permanen jika Savings Rate < 20% ATAU Pengeluaran membengkak */}
      {(isLowSavings || isOverBudget3Months) && (
        <div className="space-y-2">
          {isLowSavings && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              ⚠️ <strong>Savings Rate Rendah ({savingsRate}%):</strong> Rasio
              tabungan kamu di bawah batas aman 20%. Coba kurangi pengeluaran
              sekunder!
            </div>
          )}

          {isOverBudget3Months && (
            <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-3 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              🚨 <strong>Peringatan Pengeluaran:</strong> Pengeluaran bulan
              ini sudah melebihi rata-rata 3 bulan terakhir!
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Savings Rate Bar */}
        <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Savings Rate Bulan Ini
            </span>
            <span
              className={`text-sm font-bold ${
                savingsRate < 20
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {savingsRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                savingsRate < 20 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Target tabungan sehat minimal 20% dari total pendapatan.
          </p>
        </div>

        {/* Komparasi Bulan Lalu */}
        <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
            Perbandingan Pengeluaran
          </span>
          {comparison.isNew ? (
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Belum ada data bulan lalu
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-bold ${
                  comparison.isIncreased
                    ? "text-red-500 dark:text-red-400"
                    : "text-emerald-500 dark:text-emerald-400"
                }`}
              >
                {comparison.isIncreased ? "▲" : "▼"} {comparison.percentage}%
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {comparison.isIncreased ? "lebih boros" : "lebih hemat"}{" "}
                dibanding bulan lalu
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsightCard;