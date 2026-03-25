import { userApi } from "@/utils/apiClients";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.get("/logger-info"); // cookie auto send
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed");
    }
  }
);
