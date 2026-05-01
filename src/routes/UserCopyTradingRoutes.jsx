import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";

import CopyTradingLayout from "@/Components/copyTrading/shared/CopyTradingLayout";
import UserCopyTradingDashboard from "@/Components/copyTrading/user/UserCopyTradingDashboard";
import UserExploreMasters from "@/Components/copyTrading/user/UserExploreMasters";
import UserMyCopiedAccounts from "@/Components/copyTrading/user/UserMyCopiedAccounts";
import UserCopyTradeHistory from "@/Components/copyTrading/user/UserCopyTradeHistory";

const UserCopyTradingRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <CopyTradingLayout role="user" />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserCopyTradingDashboard />} />
        <Route path="masters" element={<UserExploreMasters />} />
        <Route path="my-accounts" element={<UserMyCopiedAccounts />} />
        <Route path="trades" element={<UserCopyTradeHistory />} />
        <Route
          path="*"
          element={<Navigate to="/user/copy-trading/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
};

export default UserCopyTradingRoutes;