import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import Transfer from "./pages/Transfer";
import Budgets from "./pages/Budgets";
import CashFlow from "./pages/CashFlow";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";

// Wrapper Halaman yang Membutuhkan Login
const ProtectedLayout = ({ handleLogout }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout handleLogout={handleLogout} />;
};

// Wrapper Halaman Publik (Jaga-jaga jika user yang sudah login mencoba buka /login lagi)
const PublicLayout = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Akses root domain langsung diarahakn ke dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth Routes (Khusus yang Belum Login) */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes (Wajib Login) */}
        <Route element={<ProtectedLayout handleLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Halaman Tidak Ditemukan -> lempar ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}