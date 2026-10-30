import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminUser: "",
  dbUsers: [],
  deposits: [],
  withdrawals: [],
  adminToggle: false,
  notification: [],
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminUser: (state, action) => {
      state.adminUser = action.payload;
    },
    setDbUsers: (state, action) => {
      state.dbUsers = action.payload;
    },
    setDeposits: (state, action) => {
      state.deposits = action.payload;
    },
    setWithdrawals: (state, action) => {
      state.withdrawals = action.payload;
    },
    setAdminToggle: (state) => {
      state.adminToggle = !state.adminToggle;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
       // ✅ ADD THIS
    resetAdmin: () => initialState,
  },
});

export const {
  resetAdmin,
  setNotification,
  setAdminUser,
  setDbUsers,
  setDeposits,
  setWithdrawals,
  setAdminToggle,
} = adminSlice.actions;

export default adminSlice.reducer;
