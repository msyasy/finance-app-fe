// Menghitung Savings Rate: ((Pemasukan - Pengeluaran) / Pemasukan) * 100
export const calculateSavingsRate = (income, expense) => {
  if (!income || income <= 0) return 0;
  const savings = income - expense;
  const rate = (savings / income) * 100;
  return Math.round(rate);
};

// Menghitung persentase perubahan pengeluaran dibanding bulan lalu
export const calculateExpenseComparison = (currentExpense, lastMonthExpense) => {
  if (!lastMonthExpense || lastMonthExpense === 0) {
    return { percentage: 0, isIncreased: false, isNew: true };
  }
  const diff = currentExpense - lastMonthExpense;
  const percentage = Math.abs(Math.round((diff / lastMonthExpense) * 100));
  return {
    percentage,
    isIncreased: diff > 0,
    isNew: false,
  };
};

// Smart Alert: Cek apakah pengeluaran bulan ini melebihi rata-rata 3 bulan terakhir
export const checkSmartAlert = (currentExpense, avgThreeMonthsExpense) => {
  if (!avgThreeMonthsExpense || avgThreeMonthsExpense === 0) return false;
  return currentExpense > avgThreeMonthsExpense;
};