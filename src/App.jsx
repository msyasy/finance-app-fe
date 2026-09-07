import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import Transfer from "./pages/Transfer";
import Budgets from "./pages/Budgets";
import Cashflow from "./pages/Cashflow";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Maintenance from "./pages/Maintenance";

export default function App() {
  // Pengecekan status maintenance dari file .env (VITE_MAINTENANCE_MODE=true)
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  // Jika maintenance aktif, langsung tampilkan halaman perbaikan tanpa merender router
  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Layout Berisi Sidebar */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/cashflow" element={<Cashflow />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}