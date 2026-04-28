import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";

// BONUS
import BonusLayout from "@/Components/user/bonus/BonusLayout";
import BonusDashboard from "@/Components/user/bonus/BonusDashboard";
import BonusDepositsTab from "@/Components/user/bonus/BonusDepositsTab";
import BonusLedgerTab from "@/Components/user/bonus/BonusLedgerTab";
import BonusPayoutsTab from "@/Components/user/bonus/BonusPayoutsTab";
import BonusTradesTab from "@/Components/user/bonus/BonusTradesTab";

const UserBonusRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <BonusLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BonusDashboard />} />
        <Route path="deposits" element={<BonusDepositsTab />} />
        {/* <Route path="ledger" element={<BonusLedgerTab />} /> */}
        <Route path="payouts" element={<BonusPayoutsTab />} />
        <Route path="trades" element={<BonusTradesTab />} />
        <Route path="*" element={<Navigate to="/user/bonus/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default UserBonusRoutes;