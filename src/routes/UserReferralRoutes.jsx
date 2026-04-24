import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";

import ReferralLayout from "@/Components/user/referral/ReferralLayout";
import ReferralDashboard from "@/Components/user/referral/ReferralDashboard";
import ReferralOverviewTab from "@/Components/user/referral/ReferralOverviewTab";
import ReferralCommissionTab from "@/Components/user/referral/ReferralCommissionTab";
import ReferralWithdrawTab from "@/Components/user/referral/ReferralWithdrawTab";
import ReferralWithdrawHistoryTab from "@/Components/user/referral/ReferralWithdrawHistoryTab";
import ReferralIbUsersTab from "@/Components/user/referral/ReferralIbUsersTab";
import ReferralMyReferralsTab from "@/Components/user/referral/ReferralMyReferralsTab";
import UserReferralCloseTrades from "@/Components/user/referral/UserReferralCloseTrades";

const UserReferralRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <ReferralLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ReferralDashboard />} />
        <Route path="overview" element={<ReferralOverviewTab />} />
        <Route path="commission" element={<ReferralCommissionTab />} />
        <Route path="withdraw" element={<ReferralWithdrawTab />} />
        <Route path="history" element={<ReferralWithdrawHistoryTab />} />
        <Route path="ib-users" element={<ReferralIbUsersTab />} />
        <Route path="my-referrals" element={<ReferralMyReferralsTab />} />
       <Route path="ib-users/:id/close-trades" element={<UserReferralCloseTrades />} />
        <Route
          path="*"
          element={<Navigate to="/user/referral/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
};

export default UserReferralRoutes;