import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState("");

  const handleExport = async (format) => {
    if (!startDate || !endDate) {
      return toast.error("Pilih tanggal awal dan tanggal akhir laporan");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return toast.error("Tanggal awal tidak boleh melebihi tanggal akhir");
    }

    setDownloadingFormat(format);
    try {
      const response = await API.get(
        `/reports/export?format=${format}&start_date=${startDate}&end_date=${endDate}`,
        { responseType: "blob" }
      );

      const mimeTypes = {
        pdf: "application/pdf",
        excel:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
      };

      const fileExtensions = {
        pdf: "pdf",
        excel: "xlsx",
        csv: "csv",
      };

      const blob = new Blob([response.data], {
        type: mimeTypes[format] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan-keuangan-${startDate}-sd-${endDate}.${fileExtensions[format]}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh!`);
    } catch {
      toast.error(`Gagal mengunduh laporan ${format.toUpperCase()}`);
    } finally {
      setDownloadingFormat("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Laporan & Ekspor Data
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Cetak dan unduh rekap mutasi keuangan kamu dalam berbagai format
        </p>
      </div>

      {/* Card Filter & Button Ekspor */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white">
            Pilih Periode Laporan
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Tentukan rentang tanggal transaksi yang ingin diekspor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tanggal Awal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Format Unduhan
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleExport("pdf")}
              disabled={Boolean(downloadingFormat)}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              📄 {downloadingFormat === "pdf" ? "Mengunduh..." : "Ekspor PDF"}
            </button>

            <button
              onClick={() => handleExport("excel")}
              disabled={Boolean(downloadingFormat)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold p-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              📊{" "}
              {downloadingFormat === "excel"
                ? "Mengunduh..."
                : "Ekspor Excel (.xlsx)"}
            </button>

            <button
              onClick={() => handleExport("csv")}
              disabled={Boolean(downloadingFormat)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            >
              📑 {downloadingFormat === "csv" ? "Mengunduh..." : "Ekspor CSV"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}