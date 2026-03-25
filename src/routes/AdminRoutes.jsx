import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import AdminLayout from "../layouts/AdminLayout";

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
        <Route index element={<div>Admin Dashboard Home</div>} />
        <Route path="users" element={<div>Manage Users</div>} />

        <Route path="/*" element={<Navigate to="/auth/admin/login" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;