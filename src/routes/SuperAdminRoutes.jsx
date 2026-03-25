import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

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
        <Route index element={<div>Super Admin Home</div>} />
        <Route path="reports" element={<div>Reports</div>} />

        <Route path="/*" element={<Navigate to="/auth/s-admin/login" replace />} />

      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;