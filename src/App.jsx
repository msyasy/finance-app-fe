import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
// Import halaman lain nanti setelah kita buat satu per satu
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import Transfer from "./pages/Transfer";
import Budgets from "./pages/Budgets";
import CashFlow from "./pages/CashFlow";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes dengan MainLayout */}
        {isAuthenticated ? (
          <Route element={<MainLayout handleLogout={handleLogout} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/cashflow" element={<CashFlow />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}