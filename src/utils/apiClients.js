// src/utils/apiClients.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL; 
// IMPORTANT: ideally BASE = "http://localhost:4000" (NO /api)
// then we will use /api/... below

const makeApi = (baseURL) => {
  const api = axios.create({
    baseURL,
    withCredentials: true, // ✅ important for cookies
  });


  // ✅ normalize backend error msg -> err.message
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const data = err?.response?.data;

      const msg =
        data?.message ||
        data?.error ||
        data?.msg ||
        err?.message ||
        "Request failed";

      const e = new Error(msg);
      e.status = status;
      e.data = data;
      return Promise.reject(e);
    }
  );

  return api;
};

// base
export const backendApi = makeApi(`${BASE}/api`);

// ADMIN
export const adminApi = makeApi(`${BASE}/api/admin`);


// SUPERADMIN
export const superAdminApi = makeApi(`${BASE}/api/superadmin`);


// user
export const userApi = makeApi(`${BASE}/api/user`,);

// ✅ COPY (add this if needed)
export const copyApi = makeApi(`${BASE}/api/copy`, () => sessionStorage.getItem("superadmin_token"));

// META
