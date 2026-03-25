import React from "react";
import { Outlet } from "react-router-dom";

const SuperAdminLayout = () => {
  return (
    <div>
      <h1>Super Admin Layout</h1>
      <Outlet />
    </div>
  );
};

export default SuperAdminLayout;