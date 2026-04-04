import { createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "@/utils/apiClients";

export const fetchAccountsInfo = createAsyncThunk(
  "user/fetchAccountsInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.post("/server-logger-info-by-account");
      console.log(res);
      
     return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed to fetch accounts data");
    }
  }
);

export const fetchIbAccountsInfo = createAsyncThunk(
  "user/fetchIbAccountsInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.post("/server-logger-info-by-account");
      console.log(res);

      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed to fetch IB accounts data");
    }
  }
);