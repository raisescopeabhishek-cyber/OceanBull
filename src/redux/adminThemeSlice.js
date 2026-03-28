import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light", // "dark" | "light"
};

const adminThemeSlice = createSlice({
  name: "adminTheme",
  initialState,
  reducers: {
    setAdminTheme: (state, action) => {
      state.mode = action.payload === "light" ? "light" : "dark";
    },
    toggleAdminTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const { setAdminTheme, toggleAdminTheme } = adminThemeSlice.actions;

export default adminThemeSlice.reducer;