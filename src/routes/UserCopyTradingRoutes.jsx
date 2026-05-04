import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";

import CopyTradingLayout from "@/Components/copyTrading/shared/CopyTradingLayout";
import UserCopyTradingDashboard from "@/Components/copyTrading/user/UserCopyTradingDashboard";
import UserExploreMasters from "@/Components/copyTrading/user/UserExploreMasters";
import UserMyCopiedAccounts from "@/Components/copyTrading/user/UserMyCopiedAccounts";
import UserCopyTradeHistory from "@/Components/copyTrading/user/UserCopyTradeHistory";
import UserMasterTradeHistory from "@/Components/copyTrading/user/UserMasterTradeHistory";
import UserCopierTradeComparison from "@/Components/copyTrading/user/UserCopierTradeComparison";
import UserMyMasterAccounts from "@/Components/copyTrading/user/UserMyMasterAccounts";
import UserMyCopierAccounts from "@/Components/copyTrading/user/UserMyCopierAccounts";

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

        <Route path="master-trades" element={<UserMasterTradeHistory />} />
<Route path="copier-trades" element={<UserCopierTradeComparison />} />


<Route path="my-master-accounts" element={<UserMyMasterAccounts />} />
<Route path="my-copier-accounts" element={<UserMyCopierAccounts />} />


        <Route
          path="*"
          element={<Navigate to="/user/copy-trading/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
};

export default UserCopyTradingRoutes;