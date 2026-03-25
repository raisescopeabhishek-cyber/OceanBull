import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("theme_mode");

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    themes: [],
    activeThemeId: saved || null,
    activeTheme: null,
  },
  reducers: {
    setThemes(state, action) {
      state.themes = action.payload || [];
      const pick =
        state.themes.find((t) => t._id === state.activeThemeId) ||
        state.themes[0] ||
        null;
      state.activeTheme = pick;
      state.activeThemeId = pick?._id || null;
    },
    setActiveTheme(state, action) {
      const id = action.payload;
      const pick = state.themes.find((t) => t._id === id);
      if (pick) {
        state.activeThemeId = id;
        state.activeTheme = pick;
        localStorage.setItem("theme_mode", id);
      }
    },
  },
});

export const { setThemes, setActiveTheme } = themeSlice.actions;
export default themeSlice.reducer;
