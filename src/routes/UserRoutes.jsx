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

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <UserLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="challenges" element={<UserChallenges />} />
        <Route path="transaction" element={<UserTransaction />} />
        <Route path="trade-history" element={<UserTradeHistory />} />
        <Route path="deposit" element={<UserDeposit />} />
        <Route path="transfer" element={<UserTransfer />} />
        <Route path="withdraw" element={<ModernWithdraw />} />
        <Route path="referrals" element={<UserReferal />} />
        <Route path="platform" element={<UserPlatform />} />
        <Route path="economic-calendar" element={<UserEconomicCalendar />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="account-details" element={<UserAccountDetails />} />
        <Route path="change-password" element={<UserChnagePassword />} />
        <Route path="master-password" element={<UserMasterPassword />} />
        <Route path="investor-password" element={<UserInvesterPassword />} />

        <Route path="customer-support" element={<UserCustomerSupport />} />
        <Route path="ticketDashboard" element={<TicketsDashboard />} />
        <Route
          path="ticketDashboard/ticket/:ticketId"
          element={<TicketsDashboard />}
        />
        <Route
          path="ticketDashboard/ticket/:ticketId/chat/:chatId"
          element={<TicketsDashboard />}
        />

        <Route path="forex-news" element={<UserForexNews />} />

        <Route path="copy-trading" element={<UserCopyTrading />} />
        <Route
          path="copy-trading/master-user/:id"
          element={<UserMasterUserCT />}
        />
        <Route path="copy-request" element={<UserCopyRequest />} />

          {/* BONUS MODULE */}
        <Route path="bonus" element={<BonusLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BonusDashboard />} />
          <Route path="overview" element={<BonusOverviewTab />} />
          <Route path="deposits" element={<BonusDepositsTab />} />
          <Route path="ledger" element={<BonusLedgerTab />} />
          <Route path="payouts" element={<BonusPayoutsTab />} />
          <Route path="trades" element={<BonusTradesTab />} />
        </Route>
        

        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;