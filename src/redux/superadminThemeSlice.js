import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark", // "dark" | "light"
};

const superadminThemeSlice = createSlice({
  name: "superadminTheme",
  initialState,
  reducers: {
    setSuperadminTheme: (state, action) => {
      state.mode = action.payload === "light" ? "light" : "dark";
    },
    toggleSuperadminTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const { setSuperadminTheme, toggleSuperadminTheme } =
  superadminThemeSlice.actions;

export default superadminThemeSlice.reducer;