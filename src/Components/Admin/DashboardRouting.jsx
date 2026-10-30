import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardBase from "./Dashboard/DashboardBase";
import Header from "./Header";
// import LogsTable from "./SideBar_Content/ManageUser/LogsTableFiles/LogsTable.jsx";

import UserDetailDashboard from "./SideBar_Content/UserDetailsDashboard";
import ManageUsers from "./Dashboard/ManageUsers";
import SetupChallenges from "./admin/SetupChallenges";
import DepositsStatus from "./admin/DepositsStatus";
import WithdrawalStatus from "./admin/WithdrawalStatus";
import IbWithdrawalStatus from "./admin/IbWithdrawalStatus";
import RulesManagement from "./admin/RulesManagement";
import ManualGetways from "./admin/ManualGetways";
import AccountConfiguration from "./admin/AccountConfiguration";
import Phases from "./admin/Phases";
import LoginLogs from "./admin/LoginLogs";
import AdminCustomEmail from "./admin/AdminCustomEmail";
import AdminIbZone from "./admin/AdminIbZone";
import KycUsers from "./admin/KycUsers";
import IbUsers from "./admin/IbUsers";
import AdminCopyRequests from "./admin/AdminCopyRequests";
import TicketsDashboard from "./CustomerSupport/TicketsDashboard";

const DashboardRouting = () => {
  const SiteConfiguration = () => <div>Site Configuration Page</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Content Routes */}
        <main className="flex-1 overflow-y-auto text-text">
          <Routes>
            <Route path="/" element={<DashboardBase />} />
            <Route path="/dashboard" element={<DashboardBase />} />
            {/* <Route path="/logs" element={<LogsTable />} /> */}

            {/* Admin module routes */}

            <Route
              path="/customerSupport/tickets"
              element={<TicketsDashboard />}
            />

            <Route
              path="/customerSupport/tickets/:id"
              element={<TicketsDashboard />}
            />
            <Route
              path="/customerSupport/tickets/:id/chat/:chatId"
              element={<TicketsDashboard />}
            />

            <Route path="/setup-challenges" element={<SetupChallenges />} />
            <Route path="/manage-users/:subList" element={<ManageUsers />} />
            <Route path="/user-detail/:id" element={<UserDetailDashboard />} />
            <Route path="/deposit/:status" element={<DepositsStatus />} />
            <Route path="/withdrawal/:status" element={<WithdrawalStatus />} />
            <Route
              path="/ib-withdrawal/:status"
              element={<IbWithdrawalStatus />}
            />
            <Route path="/rules" element={<RulesManagement />} />
            <Route path="/getway/manual" element={<ManualGetways />} />
            <Route
              path={`/account-configuration/${
                import.meta.env.VITE_S_ADMIN_PASSWORD
              }`}
              element={<AccountConfiguration />}
            />
            <Route
              path={`/phases/${import.meta.env.VITE_S_ADMIN_PASSWORD}`}
              element={<Phases />}
            />
            <Route path="/login-logs" element={<LoginLogs />} />
            <Route path="/customerSupport/custom-email" element={<AdminCustomEmail />} />
            <Route path="/ib-zone" element={<AdminIbZone />} />
            <Route path="/site-configuration" element={<SiteConfiguration />} />
            <Route path="/kyc-users" element={<KycUsers />} />
            <Route path="/ib-users" element={<IbUsers />} />
            <Route path="/copy-requests" element={<AdminCopyRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardRouting;
