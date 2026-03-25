// src/pages/theme/services/themeApi.js

import { superAdminApi } from "@/utils/apiClients";

export const apiFetchThemes = async () => {
  const res = await superAdminApi.get("/themes");
  return res.data; // { status, msg, data: { themes, activeThemeId } }
};

export const apiCreateTheme = async (themePayload) => {
  const res = await superAdminApi.post("/themes", themePayload);
  return res.data; // { status, msg, data: createdTheme }
};

// ✅ key-based update
export const apiUpdateTheme = async (key, themePayload) => {
  const res = await superAdminApi.put(`/themes/${key}`, themePayload);
  return res.data; // { status, msg, data: updatedTheme }
};

// ✅ key-based delete
export const apiDeleteTheme = async (key) => {
  const res = await superAdminApi.delete(`/themes/${key}`);
  return res.data;
};

// ✅ key-based activate
export const apiActivateTheme = async (key) => {
  const res = await superAdminApi.patch(`/themes/${key}/activate`, {}); // empty body ok
  return res.data; // { status, msg, data: { activeThemeId, themes } }
};
