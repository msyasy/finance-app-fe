import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  ArrowRightLeft,
  PieChart,
  TrendingDown,
  Tags,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export default function Sidebar({ handleLogout }) {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transaksi", icon: Receipt },
    { path: "/wallets", label: "Dompet Saya", icon: Wallet },
    { path: "/transfer", label: "Transfer Saldo", icon: ArrowRightLeft },
    { path: "/budgets", label: "Budget Planner", icon: PieChart },
    { path: "/cashflow", label: "Arus Kas", icon: TrendingDown },
    { path: "/categories", label: "Kategori", icon: Tags },
    { path: "/reports", label: "Laporan Ekspor", icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 transition-colors duration-300">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            L
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 dark:text-white tracking-wide leading-none">
              LapKeu<span className="text-blue-600 dark:text-blue-400">.App</span>
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
              Financial System
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800/40 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-gray-200"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar: Mode Switch & Logout */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Tema Tampilan
          </span>
          <DarkModeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}