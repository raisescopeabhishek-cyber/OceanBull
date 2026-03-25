// src/api/backendApi.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:4000/api

// small helper
const attachToken = (api, getToken) => {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

// USER API  -> /api/...
export const userApi = attachToken(
  axios.create({
    baseURL: BASE,
    // withCredentials: true, // ✅ only if you are still using cookies
  }),
  () => localStorage.getItem("user_token")
);

// ADMIN API -> /api/admin/...
export const adminApi = attachToken(
  axios.create({
    baseURL: `${BASE}/admin`,
    // withCredentials: true,
  }),
  () => localStorage.getItem("admin_token")
);

// SUPERADMIN API -> /api/superadmin/...
export const superAdminApi = attachToken(
  axios.create({
    baseURL: `${BASE}/api/superadmin`,
    // withCredentials: true,
  }),
  () => sessionStorage.getItem("superadmin_token")
);


export default userApi;
