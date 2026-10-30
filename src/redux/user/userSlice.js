import { createSlice } from "@reduxjs/toolkit";
import { fetchCurrentUser } from "../AsyncThunk/fetchCurrentUser";

import {
  fetchAccountsInfo,
  fetchIbAccountsInfo,
} from "../AsyncThunk/fetchAccountsInfo";


const isValidObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const calculateStats = (accounts = []) => ({
  totalBalance: accounts.reduce((sum, acc) => sum + Number(acc.Balance || 0), 0),
  totalEquity: accounts.reduce((sum, acc) => sum + Number(acc.Equity || 0), 0),
  totalProfit: accounts.reduce((sum, acc) => sum + Number(acc.Profit || 0), 0),
});


const initialState = {
  isSidebarOpen: false,
  isNewChallengeModalOpen: false,
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

   loading: false,
  isAuthenticated: false,

  accountsLoading: false,
  ibAccountsLoading: false,
  accountsError: null,
  ibAccountsError: null,

};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    handleToggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    openNewChallengeModal: (state) => {
      state.isNewChallengeModalOpen = true;
    },

    closeNewChallengeModal: (state) => {
      state.isNewChallengeModalOpen = false;
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
      } else if (!payload) {
        state.loggedUser = "";
        state.accountsData = [];
        state.accountsStats = {};
        state.ibAccountsData = [];
      }
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
      })

      .addCase(fetchAccountsInfo.pending, (state) => {
        state.accountsLoading = true;
        state.accountsError = null;
      })
      .addCase(fetchAccountsInfo.fulfilled, (state, action) => {
        state.accountsLoading = false;

        const payload = Array.isArray(action.payload) ? action.payload : [];
        state.accountsData = payload;
        state.accountsStats = calculateStats(payload);
      })
      .addCase(fetchAccountsInfo.rejected, (state, action) => {
        state.accountsLoading = false;
        state.accountsData = [];
        state.accountsStats = {
          totalBalance: 0,
          totalEquity: 0,
          totalProfit: 0,
        };
        state.accountsError = action.payload || "Failed to fetch accounts";
      })

      .addCase(fetchIbAccountsInfo.pending, (state) => {
        state.ibAccountsLoading = true;
        state.ibAccountsError = null;
      })
      .addCase(fetchIbAccountsInfo.fulfilled, (state, action) => {
        state.ibAccountsLoading = false;

        const payload = Array.isArray(action.payload) ? action.payload : [];
        state.ibAccountsData = payload;
      })
      .addCase(fetchIbAccountsInfo.rejected, (state, action) => {
        state.ibAccountsLoading = false;
        state.ibAccountsData = [];
        state.ibAccountsError = action.payload || "Failed to fetch IB accounts";
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
  openNewChallengeModal,
  closeNewChallengeModal,
} = userSlice.actions;

export default userSlice.reducer;
