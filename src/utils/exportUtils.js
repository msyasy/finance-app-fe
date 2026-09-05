import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Format Angka ke Rupiah
const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

// Helper Menyiapkan Data Bertipe Rapi & Hitung Total
const prepareData = (transactions, wallets, categories) => {
  let totalIncome = 0;
  let totalExpense = 0;

  const formattedRows = transactions.map((t, index) => {
    const walletName =
      t.wallet?.name ||
      wallets.find((w) => w.id === t.wallet_id)?.name ||
      "Dompet";
    const categoryName =
      t.category?.name ||
      categories.find((c) => c.id === t.category_id)?.name ||
      "-";

    const amount = parseFloat(t.amount || 0);
    if (t.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

    return {
      No: index + 1,
      Tanggal: new Date(t.created_at || Date.now()).toLocaleDateString("id-ID"),
      Dompet: walletName,
      Kategori: categoryName,
      Tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      NominalRaw: amount,
      NominalFormatted: formatRupiah(amount),
      Catatan: t.notes || "-",
    };
  });

  const netTotal = totalIncome - totalExpense;

  return {
    rows: formattedRows,
    totalIncome,
    totalExpense,
    netTotal,
  };
};

// 1. EXPORT KE CSV (Dengan Baris Total)
export const exportToCSV = (transactions, wallets, categories) => {
  const { rows, totalIncome, totalExpense, netTotal } = prepareData(
    transactions,
    wallets,
    categories,
  );
  if (rows.length === 0)
    return alert("Tidak ada data transaksi untuk diekspor");

  const headers = [
    "No",
    "Tanggal",
    "Dompet",
    "Kategori",
    "Tipe",
    "Nominal",
    "Catatan",
  ];
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.No,
        `"${row.Tanggal}"`,
        `"${row.Dompet}"`,
        `"${row.Kategori}"`,
        `"${row.Tipe}"`,
        row.NominalRaw,
        `"${row.Catatan}"`,
      ].join(","),
    ),
    "",
    `"","","","","TOTAL PEMASUKAN",${totalIncome},""`,
    `"","","","","TOTAL PENGELUARAN",${totalExpense},""`,
    `"","","","","TOTAL BERSIH (NET)",${netTotal},""`,
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Laporan_Transaksi_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. EXPORT KE EXCEL (.xlsx Dengan Baris Total)
export const exportToExcel = (transactions, wallets, categories) => {
  const { rows, totalIncome, totalExpense, netTotal } = prepareData(
    transactions,
    wallets,
    categories,
  );
  if (rows.length === 0)
    return alert("Tidak ada data transaksi untuk diekspor");

  const excelRows = rows.map((r) => ({
    No: r.No,
    Tanggal: r.Tanggal,
    Dompet: r.Dompet,
    Kategori: r.Kategori,
    Tipe: r.Tipe,
    Nominal: r.NominalRaw,
    Catatan: r.Catatan,
  }));

  excelRows.push(
    {},
    { Tipe: "TOTAL PEMASUKAN", Nominal: totalIncome },
    { Tipe: "TOTAL PENGELUARAN", Nominal: totalExpense },
    { Tipe: "TOTAL BERSIH (NET)", Nominal: netTotal },
  );

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");

  XLSX.writeFile(workbook, `Laporan_Transaksi_${Date.now()}.xlsx`);
};

// 3. EXPORT KE PDF (Dengan Sub-Header Ringkasan & Footer Tabel Total)
export const exportToPDF = (transactions, wallets, categories) => {
  const { rows, totalIncome, totalExpense, netTotal } = prepareData(
    transactions,
    wallets,
    categories,
  );
  if (rows.length === 0)
    return alert("Tidak ada data transaksi untuk diekspor");

  const doc = new jsPDF();

  // Judul Dokumen
  doc.setFontSize(16);
  doc.text("Laporan Riwayat Transaksi", 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, 14, 21);

  // Sub-Header Ringkasan Total Periode Ini
  doc.setFontSize(9);
  doc.setTextColor(30);
  doc.text(
    `Masuk: ${formatRupiah(totalIncome)}   |   Keluar: ${formatRupiah(
      totalExpense,
    )}   |   Bersih: ${formatRupiah(netTotal)}`,
    14,
    27,
  );

  // Data Tabel
  const tableColumn = [
    "No",
    "Tanggal",
    "Dompet",
    "Kategori",
    "Tipe",
    "Nominal",
    "Catatan",
  ];
  const tableRows = rows.map((item) => [
    item.No,
    item.Tanggal,
    item.Dompet,
    item.Kategori,
    item.Tipe,
    item.NominalFormatted,
    item.Catatan,
  ]);

  // Baris Footer Tabel Total
  const tableFoot = [
    ["", "", "", "", "Total Pemasukan", formatRupiah(totalIncome), ""],
    ["", "", "", "", "Total Pengeluaran", formatRupiah(totalExpense), ""],
    ["", "", "", "", "Saldo Bersih (Net)", formatRupiah(netTotal), ""],
  ];

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    foot: tableFoot,
    startY: 32,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
  });

  doc.save(`Laporan_Transaksi_${Date.now()}.pdf`);
};
