import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Eager imports (halaman utama - tidak dilazy agar FCP/LCP cepat)
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Lazy imports (halaman sekunder - dimuat saat dibutuhkan saja)
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Wallets = lazy(() => import("./pages/Wallets"));
const Transfer = lazy(() => import("./pages/Transfer"));
const Budgets = lazy(() => import("./pages/Budgets"));
const CashFlow = lazy(() => import("./pages/CashFlow"));
const Categories = lazy(() => import("./pages/Categories"));
const Reports = lazy(() => import("./pages/Reports"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

// Fast Skeleton Page Fallback
function PageSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  );
}

export default function App() {
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Maintenance />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes (Harus Login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
