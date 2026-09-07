import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Download, Filter } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

// Import Library Ekspor
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <--- Diubah cara import-nya agar tidak error

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        API.get("/transactions?page=1&limit=1000").catch(() => null),
        API.get("/wallets").catch(() => null),
        API.get("/categories").catch(() => null),
      ]);

      if (txRes?.data) {
        setTransactions(txRes.data.data || txRes.data.transactions || []);
      }
      if (walletRes?.data) {
        setWallets(walletRes.data.data || walletRes.data.wallets || []);
      }
      if (catRes?.data) {
        setCategories(catRes.data.data || catRes.data.categories || []);
      }
    } catch (err) {
      console.error("Gagal memuat data laporan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper Mapping Nama Dompet & Kategori
  const getWalletName = (tx) => {
    if (tx.wallet?.name) return tx.wallet.name;
    if (tx.wallet_name) return tx.wallet_name;
    const found = wallets.find((w) => String(w.id) === String(tx.wallet_id));
    return found ? found.name : "Dompet Utama";
  };

  const getCategoryName = (tx) => {
    if (tx.category?.name) return tx.category.name;
    if (tx.category_name) return tx.category_name;
    const found = categories.find(
      (c) => String(c.id) === String(tx.category_id),
    );
    return found ? found.name : "Umum";
  };

  // Helper Mendapatkan Catatan
  const getNoteText = (tx) => {
    return tx.note || tx.notes || "-";
  };

  // Filter Data Transaksi Sesuai Input Parameter
  const filteredData = transactions.filter((tx) => {
    const txDate = new Date(tx.created_at || tx.date);

    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && txDate >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = matchDate && txDate <= end;
    }

    let matchWallet = true;
    if (selectedWallet) {
      matchWallet = String(tx.wallet_id) === String(selectedWallet);
    }

    return matchDate && matchWallet;
  });

  // Format Data untuk Ekspor
  const getPreparedData = () => {
    return filteredData.map((tx, idx) => ({
      No: idx + 1,
      Tanggal: new Date(tx.created_at || tx.date).toLocaleDateString("id-ID"),
      Dompet: getWalletName(tx),
      Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      Kategori: getCategoryName(tx),
      Nominal: parseFloat(tx.amount) || 0,
      Catatan: getNoteText(tx),
    }));
  };

  // 1. EKSPOR KE CSV
  const exportToCSV = () => {
    const data = getPreparedData();
    if (data.length === 0) return toast.error("Tidak ada data untuk diekspor!");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berhasil mengekspor file CSV!");
  };

  // 2. EKSPOR KE EXCEL (.xlsx)
  const exportToExcel = () => {
    const data = getPreparedData();
    if (data.length === 0) return toast.error("Tidak ada data untuk diekspor!");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
    XLSX.writeFile(
      workbook,
      `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    toast.success("Berhasil mengekspor file Excel!");
  };

  // 3. EKSPOR KE PDF (Menggunakan fungsi autoTable secara langsung)
  const exportToPDF = () => {
    const data = getPreparedData();
    if (data.length === 0) return toast.error("Tidak ada data untuk diekspor!");

    try {
      const doc = new jsPDF();

      // Judul Dokumen
      doc.setFontSize(16);
      doc.text("Laporan Keuangan - LapKeu.App", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
        14,
        22,
      );

      // Dynamic Table Rows
      const tableColumn = [
        "No",
        "Tanggal",
        "Dompet",
        "Tipe",
        "Kategori",
        "Nominal (Rp)",
        "Catatan",
      ];
      const tableRows = data.map((item) => [
        item.No,
        item.Tanggal,
        item.Dompet,
        item.Tipe,
        item.Kategori,
        item.Nominal.toLocaleString("id-ID"),
        item.Catatan,
      ]);

      // Memanggil autoTable sebagai fungsi independen
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
      });

      doc.save(`Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Berhasil mengekspor file PDF!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Gagal membuat dokumen PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileSpreadsheet
            size={24}
            className="text-blue-600 dark:text-blue-400"
          />
          Laporan & Ekspor Data
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Unduh dokumen pembukuan keuangan kamu dalam format CSV, Excel, atau
          PDF.
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Filter size={18} className="text-blue-500" />
          <span>Filter Periode & Dompet</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Filter Dompet
            </label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons & Preview */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Opsi Unduh Dokumen
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Ditemukan{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {filteredData.length}
              </span>{" "}
              data transaksi siap diekspor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> CSV
            </button>

            <button
              onClick={exportToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={15} /> Excel (.xlsx)
            </button>

            <button
              onClick={exportToPDF}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={15} /> PDF
            </button>
          </div>
        </div>

        {/* Mini Preview Table */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Pratinjau Data (10 Terbaru)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-slate-800/60 uppercase text-[10px] text-gray-400 font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Tanggal</th>
                  <th className="p-3">Dompet</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Catatan</th>
                  <th className="p-3 text-right rounded-r-xl">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredData.slice(0, 10).map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="p-3 font-medium">
                      {new Date(tx.created_at || tx.date).toLocaleDateString(
                        "id-ID",
                      )}
                    </td>
                    <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">
                      {getWalletName(tx)}
                    </td>
                    <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">
                      {getCategoryName(tx)}
                    </td>
                    <td className="p-3 text-gray-500">{getNoteText(tx)}</td>
                    <td
                      className={`p-3 text-right font-extrabold ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                    >
                      {tx.type === "income" ? "+" : "-"} Rp{" "}
                      {(parseFloat(tx.amount) || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
