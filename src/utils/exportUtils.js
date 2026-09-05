import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Format Angka ke Rupiah
const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

// Helper Menyiapkan Data Bertipe Rapi
const prepareData = (transactions, wallets, categories) => {
  return transactions.map((t, index) => {
    const walletName =
      t.wallet?.name ||
      wallets.find((w) => w.id === t.wallet_id)?.name ||
      "Dompet";
    const categoryName =
      t.category?.name ||
      categories.find((c) => c.id === t.category_id)?.name ||
      "-";

    return {
      No: index + 1,
      Tanggal: new Date(t.created_at || Date.now()).toLocaleDateString("id-ID"),
      Dompet: walletName,
      Kategori: categoryName,
      Tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      Nominal: t.amount,
      Catatan: t.notes || "-",
    };
  });
};

// 1. EXPORT KE CSV
export const exportToCSV = (transactions, wallets, categories) => {
  const data = prepareData(transactions, wallets, categories);
  if (data.length === 0) return alert("Tidak ada data transaksi untuk diekspor");

  const headers = ["No", "Tanggal", "Dompet", "Kategori", "Tipe", "Nominal", "Catatan"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.No,
        `"${row.Tanggal}"`,
        `"${row.Dompet}"`,
        `"${row.Kategori}"`,
        `"${row.Tipe}"`,
        row.Nominal,
        `"${row.Catatan}"`,
      ].join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Laporan_Transaksi_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. EXPORT KE EXCEL (.xlsx)
export const exportToExcel = (transactions, wallets, categories) => {
  const data = prepareData(transactions, wallets, categories);
  if (data.length === 0) return alert("Tidak ada data transaksi untuk diekspor");

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

  XLSX.writeFile(workbook, `Laporan_Transaksi_${Date.now()}.xlsx`);
};

// 3. EXPORT KE PDF
export const exportToPDF = (transactions, wallets, categories) => {
  const rawData = prepareData(transactions, wallets, categories);
  if (rawData.length === 0) return alert("Tidak ada data transaksi untuk diekspor");

  const doc = new jsPDF();

  // Judul Dokumen
  doc.setFontSize(16);
  doc.text("Laporan Riwayat Transaksi", 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

  // Tabel Data
  const tableColumn = ["No", "Tanggal", "Dompet", "Kategori", "Tipe", "Nominal", "Catatan"];
  const tableRows = rawData.map((item) => [
    item.No,
    item.Tanggal,
    item.Dompet,
    item.Kategori,
    item.Tipe,
    formatRupiah(item.Nominal),
    item.Catatan,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`Laporan_Transaksi_${Date.now()}.pdf`);
};