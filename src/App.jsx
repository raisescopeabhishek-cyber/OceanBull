import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

import LoadingModal from "./LoadingModal";
import PublicRoutes from "./routes/PublicRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import UserBonusRoutes from "./routes/UserBonusRoutes";
import UserReferralRoutes from "./routes/UserReferralRoutes";

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
          <Route path="/auth/*" element={<PublicRoutes />} />
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/user/bonus/*" element={<UserBonusRoutes />} />

          <Route path="/user/referral/*" element={<UserReferralRoutes />} />


          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/s-admin/*" element={<SuperAdminRoutes />} />
          <Route path="/*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;