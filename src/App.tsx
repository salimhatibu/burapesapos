import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AuthProvider, useAuth } from "./lib/auth";
import { StoreProvider } from "./lib/store";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { PosPage } from "./pages/POS";
import { QueuePage } from "./pages/Queue";
import { PatientsPage } from "./pages/Patients";
import { PatientDetailPage } from "./pages/PatientDetail";
import { PharmacyPage } from "./pages/Pharmacy";
import { LabPage } from "./pages/Lab";
import { ExpensesPage } from "./pages/Expenses";
import { ReportsPage } from "./pages/Reports";
import { StaffPage } from "./pages/Staff";
import { SuppliersPage } from "./pages/Suppliers";
import { SettingsPage } from "./pages/Settings";
import type { JSX } from "react";

function Gate({ children }: { children: JSX.Element }) {
  const { user, ready, pending } = useAuth();
  if (!ready) return <p className="loading-line">Checking access…</p>;
  if (!user || pending) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <AuthProvider>
    <StoreProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Gate><Shell /></Gate>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
    </AuthProvider>
  );
}
