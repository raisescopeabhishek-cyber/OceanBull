import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../utils/RequireAuth";
import UserLayout from "../layouts/UserLayout";

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
        <Route index element={<div>User Dashboard Home</div>} />
        <Route path="profile" element={<div>User Profile</div>} />
        <Route path="settings" element={<div>User Settings</div>} />

         <Route path="/*" element={<Navigate to="/auth/login" replace />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;