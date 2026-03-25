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
import PublicRoutes from "./routes/PublicRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";




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
         <Route path="/" element={<Navigate to="/auth/login" replace />} />

                  {/* Public/auth routes */}
          <Route path="/auth/*" element={<PublicRoutes />} />

          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/s-admin/*" element={<SuperAdminRoutes />} />

           <Route path="/*" element={<Navigate to="/auth/login" replace />} />

        </Routes>
      </Suspense>
    </>
  );
};

export default App;
