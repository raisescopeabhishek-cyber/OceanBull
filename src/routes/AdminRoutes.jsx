import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import AdminLayout from "../layouts/AdminLayout";
import DashboardBase from "@/Components/Admin/Dashboard/DashboardBase";
import TicketsDashboard from "@/Components/Admin/CustomerSupport/TicketsDashboard";
import SetupChallenges from "@/Components/Admin/admin/SetupChallenges";
import UserDetailDashboard from "@/Components/Admin/SideBar_Content/UserDetailsDashboard";
import DepositsStatus from "@/Components/Admin/admin/DepositsStatus";
import WithdrawalStatus from "@/Components/Admin/admin/WithdrawalStatus";
import IbWithdrawalStatus from "@/Components/Admin/admin/IbWithdrawalStatus";
import RulesManagement from "@/Components/Admin/admin/RulesManagement";
import ManualGetways from "@/Components/Admin/admin/ManualGetways";
import AccountConfiguration from "@/Components/Admin/admin/AccountConfiguration";
import Phases from "@/Components/Admin/admin/Phases";
import AdminCustomEmail from "@/Components/Admin/admin/AdminCustomEmail";
import SiteConfiguration from "@/Components/Admin/admin/SiteConfiguration";
import AdminIbZone from "@/Components/Admin/admin/AdminIbZone";
import KycUsers from "@/Components/Admin/admin/KycUsers";
import IbUsers from "@/Components/Admin/admin/IbUsers";
import AdminCopyRequests from "@/Components/Admin/admin/AdminCopyRequests";
import ManageUsers from "@/Components/Admin/admin/ManageUsers";
import LoginLogs from "@/Components/Admin/admin/LoginLogs";
import BonusReports from "@/Components/Admin/admin/BonusReport/Bonus-report-page";


const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="login-logs" element={<LoginLogs />} />
 */}

         <Route path="/" element={<DashboardBase />} />
                    <Route path="/dashboard" element={<DashboardBase />} />
                    {/* <Route path="/logs" element={<LogsTable />} /> */}
        
                    {/* Admin module routes */}

                    {/* BonusReports */}

                      <Route
                      path="/BonusReports"
                      element={<BonusReports />}
                    />
        
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
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/user-detail/:id" element={<UserDetailDashboard />} />
                    <Route path="/deposit" element={<DepositsStatus />} />
                    <Route path="/withdrawal" element={<WithdrawalStatus />} />
                    <Route
                      path="/ib-withdrawal"
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



      </Route>

      <Route path="*" element={<Navigate to="/auth/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;