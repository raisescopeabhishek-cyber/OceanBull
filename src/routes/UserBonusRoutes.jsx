import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import UserLayout from "../layouts/UserLayout";

import UserDashboard from "@/Components/user/UserDashboard";
import UserNewChallenge from "@/Components/user/UserNewChallenge";
import UserChallenges from "@/Components/user/UserChallenges";
import UserTransaction from "@/Components/user/UserTransaction";
import UserTradeHistory from "@/Components/user/UserTradeHistory";
import UserDeposit from "@/Components/user/Deposite/UserDeposit";
import UserTransfer from "@/Components/user/UserTransfer";
import ModernWithdraw from "@/Components/user/UserWithdraw";
import UserReferal from "@/Components/user/UserReferals";
import UserPlatform from "@/Components/user/UserPlatform";
import UserEconomicCalendar from "@/Components/user/UserEconomicCalendar";
import UserProfile from "@/Components/user/UserProfile";
import UserAccountDetails from "@/Components/user/UserAccountDetails";
import UserChnagePassword from "@/Components/user/UserChnagePassword";
import UserMasterPassword from "@/Components/user/UserMasterPassword";
import UserInvesterPassword from "@/Components/user/UserInvestorPassword";
import UserCustomerSupport from "@/Components/user/customerSupport/UserCustomerSupport";
import TicketsDashboard from "@/Components/Admin/CustomerSupport/TicketsDashboard";
import UserForexNews from "@/Components/user/UserForexNews";
import UserReferralCloseTrades from "@/Components/user/referral/UserReferralCloseTrades";
import UserCopyTrading from "@/Components/user/UserCopyTrading";
import UserMasterUserCT from "@/Components/user/UserMasterUserCT";
import UserCopyRequest from "@/Components/user/UserCopyRequest";

// BONUS
import BonusLayout from "@/Components/user/bonus/BonusLayout";
import BonusDashboard from "@/Components/user/bonus/BonusDashboard";
import BonusOverviewTab from "@/Components/user/bonus/BonusOverviewTab";
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

        
          {/* BONUS MODULE */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BonusDashboard />} />
          <Route path="overview" element={<BonusOverviewTab />} />
          <Route path="deposits" element={<BonusDepositsTab />} />
          <Route path="ledger" element={<BonusLedgerTab />} />
          <Route path="payouts" element={<BonusPayoutsTab />} />
          <Route path="trades" element={<BonusTradesTab />} />
        

        <Route path="*" element={<Navigate to="/user/bonus/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default UserBonusRoutes;