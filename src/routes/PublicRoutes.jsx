import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthForm from "../Components/Auth/AuthForm";
import PasswordScreen from "../Components/SuperAdmin/PasswordScreen";
import UserLogin from "../Components/user/UserLogin";
import UserSignUp from "../Components/user/UserSignUp";
import UserVerify from "../Components/user/UserVerify";
import UserResetPassword from "../Components/user/UserResetPassword";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/user/login/impersonate/:userId" element={<UserLogin />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignUp />} />
      <Route path="/signup/:id" element={<UserSignUp />} />
      <Route path="/verify/:id/:token" element={<UserVerify />} />
      <Route
        path="/reset-password/:token"
        element={<UserResetPassword />}
      />

      <Route path="/admin/login" element={<AuthForm />} />
      <Route path="/s-admin/login" element={<PasswordScreen />} />

      <Route path="/*" element={<Navigate to="/auth/login" replace />} />
      <Route path="/admin/*" element={<Navigate to="/auth/admin/login" replace />} />
      <Route path="/s-admin/*" element={<Navigate to="/auth/s-admin/login" replace />} />


    </Routes>
  );
};

export default PublicRoutes;