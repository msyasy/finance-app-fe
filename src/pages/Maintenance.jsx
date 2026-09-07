import React from "react";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 text-center transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 max-w-md w-full space-y-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-3xl">
          🛠️
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Sistem Sedang Dalam Perbaikan
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Kami sedang melakukan pemeliharaan rutin untuk meningkatkan performa sistem. Silakan kembali beberapa saat lagi.
          </p>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full text-[11px] font-semibold">
            Status: Maintenance Mode
          </span>
        </div>
      </div>
    </div>
  );
}