import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

import DashboardRouting from "./Components/Admin/DashboardRouting";
import AuthForm from "./Components/Auth/AuthForm";
import LoadingModal from "./LoadingModal";
import SuperAdmin_DashboardRouting from "./Components/SuperAdmin/DashboardRouting";
import PasswordScreen from "./Components/SuperAdmin/PasswordScreen";
import UserDashboardRouting from "./Components/user/UserDashboardRouting";
import UserLogin from "./Components/user/UserLogin";
import UserSignUp from "./Components/user/UserSignUp";
import UserVerify from "./Components/user/UserVerify";
import UserResetPassword from "./Components/user/UserResetPassword";
import RequireAuth from "./utils/RequireAuth";




const App = () => {
  


  
  return (
    <>
    <Toaster position="top-right" />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Suspense fallback={<LoadingModal />}>
        <Routes>
          {/* Default route → redirect to /user */}
          <Route path="/" element={<Navigate to="/user" replace />} />
          {/* User login */}
          {/* <Route path="/user/authentication" element={<UserAuthForm />} /> */}
          <Route path="/user/login/impersonate/:userId" element={<UserLogin />} />

          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignUp />} />{" "}
          {/* <-- Add signup component here */}
          <Route path="/user/signup/:id" element={<UserSignUp />} />
          <Route path="/user/verify/:id/:token" element={<UserVerify />} />
          <Route
            path="/user/reset-password/:token"
            element={<UserResetPassword />}
          />
          {/* Admin login */}
          <Route path="/admin/login" element={<AuthForm />} />
          {/* Super Admin login */}
          <Route
            path="/s-admin/login"
            element={
              <PasswordScreen
                // onAuthenticate={() => window.location.replace("/s-admin")}
              />
            }
          />
          {/* User protected */}
          <Route
            path="/user/*"
            element={
              <RequireAuth>
                <UserDashboardRouting />
              </RequireAuth>
            }
          />
          {/* Admin protected */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth>
                <DashboardRouting />
              </RequireAuth>
            }
          />
          {/* Super Admin protected */}
          <Route
            path="/s-admin/*"
            element={
              <RequireAuth>
                <SuperAdmin_DashboardRouting />
              </RequireAuth>
            }
          />
          {/* Catch-all → redirect to /user */}
          {/* <Route path="*" element={<Navigate to="/user" replace />} /> */}
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
