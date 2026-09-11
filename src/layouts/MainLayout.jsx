import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAutoLogout from "../hooks/useAutoLogout";

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Jalankan pemantau aktivitas idle 5 menit
  useAutoLogout();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Berhasil keluar dari akun");
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Overlay Gelap Saat Sidebar Terbuka di HP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header Khusus Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-wide text-blue-600 dark:text-blue-400">
            LapKeu
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
            msyasy.xyz
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Container (Fixed Drawer di HP, Static di Laptop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar handleLogout={handleLogout} onItemClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}