import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

import Platform from "@/Components/SuperAdmin/SideBar_Content/Platform/Platform";
import GroupManagement from "@/Components/SuperAdmin/SideBar_Content/Groups/GroupManagement";
import AccountTypes from "@/Components/Admin/account-configuration/AccountType";
import SadminSiteConfiguration from "@/Components/SuperAdmin/SideBar_Content/SadminSiteConfiguration";
import ThemeConfig from "@/Components/SuperAdmin/Theme/ThemeConfig";
import SadminAdminInfo from "@/Components/SuperAdmin/SideBar_Content/SadminInfo";
import SadminBonusConfig from "@/Components/SuperAdmin/SideBar_Content/DepositeBonue/SadminBonusConfig";
import BonusConfig from "@/Components/SuperAdmin/SideBar_Content/DepositeBonue/BonusConfig";
import TradeLotBonusConfig from "@/Components/SuperAdmin/SideBar_Content/DepositeBonue/TradeLotBonusConfig";
import DepositBonusConfig from "@/Components/SuperAdmin/SideBar_Content/DepositeBonue/DepositBonusConfig";

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <SuperAdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Platform />} />
        <Route path="Group" element={<GroupManagement />} />
        <Route path="Platform" element={<Platform />} />
        {/* <Route path="DepositeBonue" element={<SadminBonusConfig />} /> */}

        <Route path="DepositBonusConfig" element={<DepositBonusConfig />} />
        <Route path="TradeLotBonusConfig" element={<TradeLotBonusConfig />} />





        <Route path="configure-account-types" element={<AccountTypes />} />
        <Route path="site-configuration" element={<SadminSiteConfiguration />} />
        <Route path="theme-config" element={<ThemeConfig />} />
        <Route path="admin-information" element={<SadminAdminInfo />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth/s-admin/login" replace />} />
    </Routes>
  );
};

export default SuperAdminRoutes;