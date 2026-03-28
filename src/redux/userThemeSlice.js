import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
};

const userThemeSlice = createSlice({
  name: "userTheme",
  initialState,
  reducers: {
    setUserTheme: (state, action) => {
      state.mode = action.payload === "light" ? "light" : "dark";
    },
    toggleUserTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const { setUserTheme, toggleUserTheme } = userThemeSlice.actions;
export default userThemeSlice.reducer;