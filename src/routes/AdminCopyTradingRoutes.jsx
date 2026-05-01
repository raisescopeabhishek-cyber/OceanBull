import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";

import CopyTradingLayout from "@/Components/copyTrading/shared/CopyTradingLayout";
import AdminCopyTradingDashboard from "@/Components/copyTrading/admin/AdminCopyTradingDashboard";
import AdminMasters from "@/Components/copyTrading/admin/AdminMasters";
import AdminCopiers from "@/Components/copyTrading/admin/AdminCopiers";
import AdminTradeMonitor from "@/Components/copyTrading/admin/AdminTradeMonitor";

const AdminCopyTradingRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <CopyTradingLayout role="admin" />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminCopyTradingDashboard />} />
        <Route path="masters" element={<AdminMasters />} />
        <Route path="copiers" element={<AdminCopiers />} />
        <Route path="trades" element={<AdminTradeMonitor />} />
        <Route
          path="*"
          element={<Navigate to="/admin/copy-trading/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
};

export default AdminCopyTradingRoutes;