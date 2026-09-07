import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import useAutoLogout from "../hooks/useAutoLogout";

export default function MainLayout() {
  const navigate = useNavigate();

  // Jalankan pemantau aktivitas idle 5 menit
  useAutoLogout();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Berhasil keluar dari akun");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}