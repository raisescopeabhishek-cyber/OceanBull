// src/utils/authService.js
import { adminApi,userApi, backendApi } from "../../utils/apiClients";

export const adminLogin = async (email, password) => {
  const { data } = await backendApi.post("/auth/admin/login", { email, password });
  // expect: { token, userExist } or { token, user }
  return data;
};

// user notifications (USER)
export const fetchUserNotifications = async (userId) => {
  if (!userId) return [];
  const { data } = await userApi.get(`/get-all-notification/${userId}`);
  return data?.success ? data.data : [];
};

export const markNotificationRead = async (noteId) => {
  await userApi.put(`/mark-notification-read/${noteId}`);
};



