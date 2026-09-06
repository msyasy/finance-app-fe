import React from 'react';
import { NavLink } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

export default function Sidebar({ handleLogout }) {
  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '🏠' },
    { path: '/transactions', label: '💸 Transaksi', icon: '📝' },
    { path: '/wallets', label: '💳 Dompet Saya', icon: '👛' },
    { path: '/transfer', label: '🔄 Transfer Saldo', icon: '⇄' },
    { path: '/budgets', label: '🎯 Budget Planner', icon: '📊' },
    { path: '/cashflow', label: '📈 Arus Kas', icon: '📉' },
    { path: '/categories', label: '🏷️ Kategori', icon: '📂' },
    { path: '/reports', label: '📄 Laporan Ekspor', icon: '📑' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between p-5 transition-colors duration-300 hidden md:flex shrink-0">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-wide">
             Revenue & Expense<span className="text-blue-600">.Overview</span>
          </h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            Manajemen Keuangan Pribadi
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tema</span>
          <DarkModeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
        >
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
}