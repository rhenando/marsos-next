// app/supplier-dashboard/page.jsx
import Dashboard from "@/components/supplier/Dashboard";
import { ProtectedRoute } from "@/context/AuthContext";

export const metadata = {
  title: "Supplier Dashboard | Marsos",
  description:
    "Manage your supplier profile, products, RFQs and orders on Marsos.",
};

export default function SupplierDashboardPage() {
  return (
    <ProtectedRoute requiredRole='supplier'>
      <Dashboard />
    </ProtectedRoute>
  );
}
