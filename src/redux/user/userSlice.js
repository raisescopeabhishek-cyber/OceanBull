import { createSlice } from "@reduxjs/toolkit";
import { fetchCurrentUser } from "../AsyncThunk/fetchCurrentUser";

const initialState = {
  isSidebarOpen: false,
  openTrades: [],
  loggedUser: "",
  platforms: [],
  paymentMethods: [],
  totalFinalPnL: 0,
  siteConfig: "",
  themeConfig: "",
  accountsData: [],
  accountsStats: {},
  ibAccountsData: [],
  notification: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    handleToggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setOpenTrades: (state, action) => {
      state.openTrades = action.payload;
    },
    setLoggedUser: (state, action) => {
      const payload = action.payload;
      console.log(payload);

      const isPlainObject =
        payload !== null &&
        typeof payload === "object" &&
        !Array.isArray(payload);

      if (isPlainObject) {
        state.loggedUser = payload;
      }
      // else: ignore (array/other types state me nahi jayenge)
    },

    setPlatforms: (state, action) => {
      state.platforms = action.payload;
    },
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
    setTotalFinalPnL: (state, action) => {
      state.totalFinalPnL = action.payload;
    },
    setSiteConfig: (state, action) => {
      state.siteConfig = action.payload;
    },
    setThemeConfig: (state, action) => {
      state.themeConfig = action.payload;
    },
    setAccountsData: (state, action) => {
      state.accountsData = action.payload;
    },
    setAccountStats: (state, action) => {
      state.accountsStats = action.payload;
    },
    setIbAccountsData: (state, action) => {
      state.ibAccountsData = action.payload;
    },

    setNotification: (state, action) => {
      state.notification = action.payload;
    },

    resetTheme: (state) => {
      if (state.siteConfig) {
        state.siteConfig.themeColor = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
         const payload = action.payload;
      console.log(payload);

      const isPlainObject =
        payload !== null &&
        typeof payload === "object" &&
        !Array.isArray(payload);

      if (isPlainObject) {
        state.loggedUser = payload;
      }

      
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  setThemeConfig,
  setNotification,
  handleToggleSidebar,
  setLoggedUser,
  setOpenTrades,
  setPlatforms,
  setPaymentMethods,
  setTotalFinalPnL,
  setSiteConfig,
  setAccountsData,
  setAccountStats,
  setIbAccountsData,
  resetTheme,
} = userSlice.actions;

export default userSlice.reducer;
